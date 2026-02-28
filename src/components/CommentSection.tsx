import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Helper to format date relative (e.g. "2 hours ago")
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

interface Comment {
    id: string;
    content: string;
    author_name: string;
    author_email: string;
    author_avatar: string; // URL or null
    created_at: string;
    parent_id: string | null;
    likes: number;
}

interface Liker {
    avatar: string | null;
    name: string;
    email: string;
}

// Generate a consistent color from an email string
function emailToColor(email: string): string {
    const colors = [
        '#E57373', '#F06292', '#BA68C8', '#9575CD',
        '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1',
        '#4DB6AC', '#81C784', '#AED581', '#FFD54F',
        '#FFB74D', '#FF8A65', '#A1887F', '#90A4AE'
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function CommentSection({ slug }: { slug: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginSent, setLoginSent] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [authorLikes, setAuthorLikes] = useState<Record<string, boolean>>({}); // comment_id -> likedByAuthor
    const [postLikes, setPostLikes] = useState<number>(0);
    const [isPostLiked, setIsPostLiked] = useState<boolean>(false);
    const [likerAvatars, setLikerAvatars] = useState<Liker[]>([]);
    const [uploading, setUploading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [userCommentLikes, setUserCommentLikes] = useState<Record<string, boolean>>({});
    const [commentLikerMap, setCommentLikerMap] = useState<Record<string, Liker[]>>({});
    const [showLikerPanel, setShowLikerPanel] = useState(false);
    const [showCommentLikerPanel, setShowCommentLikerPanel] = useState<string | null>(null);

    const AUTHOR_EMAIL = "vleoneljunior@gmail.com";

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                setDisplayName(currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || "");
                checkIfPostLiked(currentUser.email || "");
                fetchUserCommentLikes(currentUser.email || "");
            } else {
                setUserCommentLikes({});
            }
        });

        fetchComments();
        fetchAuthorLikes();
        fetchPostStats();
        fetchCommentLikers();

        return () => subscription.unsubscribe();
    }, [slug]);

    const fetchComments = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_slug', slug)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching comments:', error);
        else setComments(data || []);
        setLoading(false);
    };

    const fetchAuthorLikes = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_email', AUTHOR_EMAIL);

        if (!error && data) {
            const likes: Record<string, boolean> = {};
            data.forEach((like: { comment_id: string }) => likes[like.comment_id] = true);
            setAuthorLikes(likes);
        }
    };

    const fetchPostStats = async () => {
        if (!supabase) return;
        // Get total likes
        const { count, error } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_slug', slug);

        if (!error && count !== null) setPostLikes(count);

        // Get recent likers (avatars + names for initials)
        const { data: likerData } = await supabase
            .from('post_likes')
            .select('user_avatar, user_name, user_email')
            .eq('post_slug', slug)
            .limit(5);

        if (likerData) {
            const seen = new Set<string>();
            const likers: Liker[] = [];
            likerData.forEach((d: { user_avatar: string | null; user_name: string | null; user_email: string }) => {
                if (!seen.has(d.user_email)) {
                    seen.add(d.user_email);
                    likers.push({ avatar: d.user_avatar, name: d.user_name || d.user_email.split('@')[0], email: d.user_email });
                }
            });
            setLikerAvatars(likers);
        }
    };

    const fetchCommentLikers = async () => {
        if (!supabase) return;
        // Get all comment IDs for this post
        const { data: commentData } = await supabase
            .from('comments')
            .select('id')
            .eq('post_slug', slug);

        if (!commentData || commentData.length === 0) return;

        const commentIds = commentData.map((c: { id: string }) => c.id);

        const { data: likesData } = await supabase
            .from('comment_likes')
            .select('comment_id, user_email, user_name, user_avatar')
            .in('comment_id', commentIds);

        if (likesData) {
            const map: Record<string, Liker[]> = {};
            likesData.forEach((d: { comment_id: string; user_email: string; user_name: string | null; user_avatar: string | null }) => {
                if (!map[d.comment_id]) map[d.comment_id] = [];
                map[d.comment_id].push({
                    avatar: d.user_avatar,
                    name: d.user_name || d.user_email.split('@')[0],
                    email: d.user_email
                });
            });
            setCommentLikerMap(map);
        }
    };

    const checkIfPostLiked = async (userEmail: string) => {
        if (!supabase || !userEmail) return;
        const { data } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_slug', slug)
            .eq('user_email', userEmail)
            .maybeSingle();

        setIsPostLiked(!!data);
    };

    const fetchUserCommentLikes = async (email: string) => {
        if (!supabase || !email) return;
        const { data } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_email', email);
        if (data) {
            const likes: Record<string, boolean> = {};
            data.forEach((l: { comment_id: string }) => likes[l.comment_id] = true);
            setUserCommentLikes(likes);
        }
    };

    const handleEmailLogin = async (e: Event) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoginLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                emailRedirectTo: window.location.href,
            }
        });

        setLoginLoading(false);
        if (error) {
            alert('Error: ' + error.message);
        } else {
            setLoginSent(true);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        const { error } = await supabase.from('comments').insert({
            post_slug: slug,
            author_name: displayName || user.email?.split('@')[0] || 'Anonymous',
            author_email: user.email || '',
            author_avatar: user.user_metadata?.avatar_url,
            content: newComment.trim(),
            parent_id: replyTo
        });

        if (error) {
            alert('Error posting comment: ' + error.message);
        } else {
            setNewComment("");
            setReplyTo(null);
            fetchComments();
        }
    };

    const handleUpdateName = async () => {
        if (!user || !displayName.trim()) return;
        const { error } = await supabase.auth.updateUser({
            data: { full_name: displayName.trim() }
        });
        if (error) alert(error.message);
        else setIsEditingName(false);
    };

    const handlePostLike = async () => {
        if (!user) {
            alert("Please sign in to like this post.");
            return;
        }

        if (isPostLiked) {
            // UNLIKE
            setIsPostLiked(false);
            setPostLikes(prev => prev - 1);
            const { error } = await supabase.from('post_likes')
                .delete()
                .eq('post_slug', slug)
                .eq('user_email', user.email);

            if (error) {
                setIsPostLiked(true);
                setPostLikes(prev => prev + 1);
                alert(error.message);
            } else {
                fetchPostStats();
            }
            return;
        }

        // LIKE
        setIsPostLiked(true);
        setPostLikes(prev => prev + 1);

        const { error } = await supabase.from('post_likes').insert({
            post_slug: slug,
            user_email: user.email || '',
            user_avatar: user.user_metadata?.avatar_url || null,
            user_name: displayName || user.email?.split('@')[0] || 'Anonymous'
        });

        if (error) {
            setIsPostLiked(false);
            setPostLikes(prev => prev - 1);
            alert(error.message);
        } else {
            fetchPostStats();
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post!',
                url: url
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    const handleAvatarUpload = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file || !user) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user profile
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            // Update local state to show the new avatar immediately
            setUser({
                ...user,
                user_metadata: { ...user.user_metadata, avatar_url: publicUrl }
            });

            // Also update avatar in post_likes so stacked circles stay current
            await supabase.from('post_likes')
                .update({ user_avatar: publicUrl })
                .eq('user_email', user.email);

            // Also update avatar in comment_likes
            await supabase.from('comment_likes')
                .update({ user_avatar: publicUrl })
                .eq('user_email', user.email);

            // Refresh the liker avatars display
            fetchPostStats();
            fetchCommentLikers();

            alert('Avatar updated successfully!');
        } catch (error: any) {
            alert('Error updating avatar: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleLike = async (commentId: string) => {
        if (!user) {
            alert("Please sign in to like comments.");
            return;
        }

        const isLiked = userCommentLikes[commentId];

        if (isLiked) {
            // UNLIKE
            const newLikes = { ...userCommentLikes };
            delete newLikes[commentId];
            setUserCommentLikes(newLikes);

            setComments(comments.map(c =>
                c.id === commentId ? { ...c, likes: c.likes - 1 } : c
            ));

            if (user.email === AUTHOR_EMAIL) {
                const updated = { ...authorLikes };
                delete updated[commentId];
                setAuthorLikes(updated);
            }

            const { error } = await supabase.from('comment_likes')
                .delete()
                .eq('comment_id', commentId)
                .eq('user_email', user.email);

            if (error) {
                alert(error.message);
                fetchComments();
                fetchUserCommentLikes(user.email || "");
            } else {
                fetchCommentLikers();
            }
            return;
        }

        // LIKE
        setUserCommentLikes({ ...userCommentLikes, [commentId]: true });
        setComments(comments.map(c =>
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        ));

        if (user.email === AUTHOR_EMAIL) {
            setAuthorLikes({ ...authorLikes, [commentId]: true });
        }

        const { error } = await supabase.from('comment_likes').insert({
            comment_id: commentId,
            user_email: user.email || '',
            user_name: displayName || user.email?.split('@')[0] || 'Anonymous',
            user_avatar: user.user_metadata?.avatar_url || null
        });

        if (error) {
            if (error.code === '23505') {
                // Keep it liked if it was already in DB
            } else {
                alert(error.message);
                fetchComments();
                fetchUserCommentLikes(user.email || "");
            }
        }
        fetchCommentLikers();
    };

    // Organize comments into threads (simple 1-level nesting for now)
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

    return (
        <div class="font-sans text-quartz dark:text-quartz-light">
            {/* Interaction Bar (Substack Style) */}
            <div class="border-y border-gray-100 dark:border-white/10 py-3 mb-10">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <div class="flex -space-x-2 overflow-hidden cursor-pointer" onClick={() => setShowLikerPanel(!showLikerPanel)}>
                                {likerAvatars.length > 0 ? (
                                    likerAvatars.map((liker, i) => (
                                        liker.avatar ? (
                                            <img key={i} class="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover hover:scale-110 transition-transform" src={liker.avatar} alt={liker.name} title={liker.name} />
                                        ) : (
                                            <div key={i} class="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900 text-white text-xs font-bold hover:scale-110 transition-transform" style={{ backgroundColor: emailToColor(liker.email) }} title={liker.name}>
                                                {liker.name.charAt(0).toUpperCase()}
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <div class="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                                        <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                    </div>
                                )}
                            </div>
                            {/* Liker Panel Popover */}
                            {showLikerPanel && likerAvatars.length > 0 && (
                                <div class="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 p-3 z-50 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-150">
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Liked by</p>
                                    <div class="space-y-2 max-h-[200px] overflow-y-auto">
                                        {likerAvatars.map((liker, i) => (
                                            <div key={i} class="flex items-center gap-2">
                                                {liker.avatar ? (
                                                    <img class="w-6 h-6 rounded-full object-cover" src={liker.avatar} alt={liker.name} />
                                                ) : (
                                                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: emailToColor(liker.email) }}>
                                                        {liker.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span class="text-xs font-medium text-quartz dark:text-quartz-light">{liker.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div class="text-sm font-medium text-gray-500">
                            <span class="text-quartz dark:text-quartz-light">{postLikes.toLocaleString()}</span> Likes • <span class="text-quartz dark:text-quartz-light">{comments.length}</span> Comments
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            onClick={handlePostLike}
                            class={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-sm font-bold ${isPostLiked ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={isPostLiked ? "currentColor" : "none"} stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            {isPostLiked ? 'Liked' : 'Like'}
                        </button>
                        <button
                            onClick={handleShare}
                            class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-sm font-bold"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Share
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between mb-8">
                <h3 class="text-xl font-bold font-serif">
                    Discussion about this post
                    <span class="ml-3 text-sm font-normal text-quartz/50 dark:text-quartz-light/50 bg-quartz/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                        {comments.length}
                    </span>
                </h3>

            </div>

            {/* Input Area */}
            {!user ? (
                <div class="bg-gray-50 dark:bg-white/5 rounded-lg p-6 border border-gray-100 dark:border-white/10 mb-10">
                    {loginSent ? (
                        <div class="text-center py-4">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <h4 class="font-bold mb-1">Verification link sent</h4>
                            <p class="text-sm text-gray-500">A verification link has been sent to <span class="font-medium text-quartz dark:text-quartz-light">{email}</span>.</p>
                            <button onClick={() => setLoginSent(false)} class="mt-4 text-xs font-bold text-quartz dark:text-quartz-light hover:underline">Use a different email</button>
                        </div>
                    ) : (
                        <div>
                            <p class="mb-4 text-sm font-medium text-center">Join the discussion</p>
                            <form onSubmit={handleEmailLogin} class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                                    class="flex-1 px-4 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-quartz outline-none transition shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={loginLoading || !email.trim()}
                                    class="bg-quartz dark:bg-quartz-light text-white dark:text-quartz px-6 py-2 rounded font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loginLoading ? 'Sending...' : 'Sign in with email'}
                                </button>
                            </form>
                            <p class="mt-4 text-[10px] text-center text-gray-400">
                                A secure sign-in link will be sent to your email address.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div class="mb-10">
                    <form onSubmit={handleSubmit} class="relative">
                        <div class="flex items-start gap-3">
                            <div class="relative group">
                                {user.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt={user.user_metadata.full_name || 'User'}
                                        class="w-10 h-10 rounded-full border border-gray-200 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                        onClick={() => setPreviewAvatar(user.user_metadata.avatar_url)}
                                    />
                                ) : (
                                    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold">
                                        {user.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <label class="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:text-red-500 transition-colors">
                                    <input type="file" accept="image/*" class="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                                    {uploading ? (
                                        <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                    )}
                                </label>
                            </div>
                            <div class="flex-1">
                                {isEditingName ? (
                                    <div class="flex gap-2 mb-2">
                                        <input
                                            value={displayName}
                                            onInput={(e) => setDisplayName((e.target as HTMLInputElement).value)}
                                            class="text-xs border-b border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:border-red-500"
                                            placeholder="Display name"
                                        />
                                        <button type="button" onClick={handleUpdateName} class="text-[10px] font-bold text-red-600">Save</button>
                                        <button type="button" onClick={() => setIsEditingName(false)} class="text-[10px] text-gray-400">Cancel</button>
                                    </div>
                                ) : (
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="text-xs font-bold">{displayName || "Set your name"}</span>
                                        {user.email === AUTHOR_EMAIL && (
                                            <span class="text-[10px] font-bold bg-quartz/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-quartz/60 dark:text-quartz-light/60">
                                                Author
                                            </span>
                                        )}
                                        <button type="button" onClick={() => setIsEditingName(true)} class="text-[10px] text-gray-400 hover:text-red-500 transition">Edit profile</button>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onInput={(e) => setNewComment((e.target as HTMLTextAreaElement).value)}
                                    placeholder="Write a comment..."
                                    class="w-full bg-transparent border-2 border-gray-300/40 dark:border-gray-600/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 rounded-lg p-3 outline-none min-h-[80px] resize-y text-sm transition-all"
                                />
                                <div class="flex justify-between items-center mt-2">
                                    <button type="button" onClick={handleLogout} class="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        class="bg-red-600 text-white px-6 py-2 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition shadow-sm"
                                    >
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div class="space-y-8">
                {loading ? (
                    <p class="text-center text-sm text-gray-400 animate-pulse">Loading discussion...</p>
                ) : rootComments.length === 0 ? (
                    <p class="text-center text-sm text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    rootComments.map(comment => (
                        <div key={comment.id} class="group">
                            {/* Comment Body */}
                            <div class="flex gap-3">
                                <div class="flex-shrink-0 pt-1">
                                    {comment.author_avatar ? (
                                        <img
                                            src={comment.author_avatar}
                                            alt={comment.author_name}
                                            class="w-8 h-8 rounded-full border border-gray-100 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                            onClick={() => setPreviewAvatar(comment.author_avatar)}
                                        />
                                    ) : (
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: emailToColor(comment.author_email) }}>
                                            {comment.author_name[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-baseline justify-between mb-1">
                                        <div class="flex items-center gap-2">
                                            <h4 class="text-sm font-bold text-quartz dark:text-quartz-light">{comment.author_name}</h4>
                                            {comment.author_email === AUTHOR_EMAIL && (
                                                <span class="text-[10px] font-bold bg-quartz/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-quartz/60 dark:text-quartz-light/60">
                                                    Author
                                                </span>
                                            )}
                                        </div>
                                        <span class="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                                    </div>
                                    {authorLikes[comment.id] && (
                                        <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-100 bg-red-50 text-red-600 text-[10px] font-bold mb-2">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                            Liked by Léonel
                                        </div>
                                    )}
                                    <div class="text-sm text-quartz/80 dark:text-quartz-light/80 leading-relaxed whitespace-pre-wrap mb-2">
                                        {comment.content}
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <button
                                            onClick={() => handleLike(comment.id)}
                                            class={`text-xs font-medium flex items-center gap-1 transition ${userCommentLikes[comment.id] ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-quartz dark:hover:text-white'}`}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill={userCommentLikes[comment.id] ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                            Like {comment.likes > 0 && `(${comment.likes})`}
                                        </button>
                                        {commentLikerMap[comment.id] && commentLikerMap[comment.id].length > 0 && (
                                            <div class="relative">
                                                <div class="flex -space-x-1.5 items-center cursor-pointer" onClick={() => setShowCommentLikerPanel(showCommentLikerPanel === comment.id ? null : comment.id)} title={commentLikerMap[comment.id].map(l => l.name).join(', ')}>
                                                    {commentLikerMap[comment.id].slice(0, 3).map((liker, i) => (
                                                        liker.avatar ? (
                                                            <img key={i} class="w-5 h-5 rounded-full ring-1 ring-white dark:ring-gray-900 object-cover hover:scale-110 transition-transform" src={liker.avatar} alt={liker.name} />
                                                        ) : (
                                                            <div key={i} class="w-5 h-5 rounded-full ring-1 ring-white dark:ring-gray-900 flex items-center justify-center text-white text-[8px] font-bold hover:scale-110 transition-transform" style={{ backgroundColor: emailToColor(liker.email) }}>
                                                                {liker.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )
                                                    ))}
                                                    {commentLikerMap[comment.id].length > 3 && (
                                                        <span class="text-[10px] text-gray-400 ml-1">+{commentLikerMap[comment.id].length - 3}</span>
                                                    )}
                                                </div>
                                                {showCommentLikerPanel === comment.id && (
                                                    <div class="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 p-3 z-50 min-w-[180px]">
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Liked by</p>
                                                        <div class="space-y-2 max-h-[160px] overflow-y-auto">
                                                            {commentLikerMap[comment.id].map((liker, i) => (
                                                                <div key={i} class="flex items-center gap-2">
                                                                    {liker.avatar ? (
                                                                        <img class="w-5 h-5 rounded-full object-cover" src={liker.avatar} alt={liker.name} />
                                                                    ) : (
                                                                        <div class="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: emailToColor(liker.email) }}>
                                                                            {liker.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <span class="text-[11px] font-medium text-quartz dark:text-quartz-light">{liker.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                            class="text-xs font-medium text-gray-400 hover:text-quartz dark:hover:text-white flex items-center gap-1 transition"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            <div class="pl-11 mt-3 space-y-4">
                                {getReplies(comment.id).map(reply => (
                                    <div key={reply.id} class="flex gap-3">
                                        <div class="flex-shrink-0 pt-1">
                                            {reply.author_avatar ? (
                                                <img
                                                    src={reply.author_avatar}
                                                    alt={reply.author_name}
                                                    class="w-6 h-6 rounded-full border border-gray-100 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                                    onClick={() => setPreviewAvatar(reply.author_avatar)}
                                                />
                                            ) : (
                                                <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: emailToColor(reply.author_email) }}>
                                                    {reply.author_name[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex items-baseline justify-between mb-1">
                                                <div class="flex items-center gap-2">
                                                    <h4 class="text-xs font-bold text-quartz dark:text-quartz-light">{reply.author_name}</h4>
                                                    {reply.author_email === AUTHOR_EMAIL && (
                                                        <span class="text-[9px] font-bold bg-quartz/5 dark:bg-white/10 px-1 py-0.5 rounded text-quartz/60 dark:text-quartz-light/60">
                                                            Author
                                                        </span>
                                                    )}
                                                </div>
                                                <span class="text-[10px] text-gray-400">{timeAgo(reply.created_at)}</span>
                                            </div>
                                            {authorLikes[reply.id] && (
                                                <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-100 bg-red-50 text-red-600 text-[10px] font-bold mb-2">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                    Liked by Léonel
                                                </div>
                                            )}
                                            <div class="text-sm text-quartz/80 dark:text-quartz-light/80 leading-relaxed whitespace-pre-wrap mb-2">
                                                {reply.content}
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleLike(reply.id)}
                                                    class={`text-[11px] font-medium flex items-center gap-1 transition ${userCommentLikes[reply.id] ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-quartz dark:hover:text-white'}`}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill={userCommentLikes[reply.id] ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                    Like {reply.likes > 0 && `(${reply.likes})`}
                                                </button>
                                                {commentLikerMap[reply.id] && commentLikerMap[reply.id].length > 0 && (
                                                    <div class="relative">
                                                        <div class="flex -space-x-1 items-center cursor-pointer" onClick={() => setShowCommentLikerPanel(showCommentLikerPanel === reply.id ? null : reply.id)} title={commentLikerMap[reply.id].map(l => l.name).join(', ')}>
                                                            {commentLikerMap[reply.id].slice(0, 3).map((liker, i) => (
                                                                liker.avatar ? (
                                                                    <img key={i} class="w-4 h-4 rounded-full ring-1 ring-white dark:ring-gray-900 object-cover hover:scale-110 transition-transform" src={liker.avatar} alt={liker.name} />
                                                                ) : (
                                                                    <div key={i} class="w-4 h-4 rounded-full ring-1 ring-white dark:ring-gray-900 flex items-center justify-center text-white text-[7px] font-bold hover:scale-110 transition-transform" style={{ backgroundColor: emailToColor(liker.email) }}>
                                                                        {liker.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )
                                                            ))}
                                                            {commentLikerMap[reply.id].length > 3 && (
                                                                <span class="text-[9px] text-gray-400 ml-1">+{commentLikerMap[reply.id].length - 3}</span>
                                                            )}
                                                        </div>
                                                        {showCommentLikerPanel === reply.id && (
                                                            <div class="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 p-3 z-50 min-w-[160px]">
                                                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Liked by</p>
                                                                <div class="space-y-2 max-h-[140px] overflow-y-auto">
                                                                    {commentLikerMap[reply.id].map((liker, i) => (
                                                                        <div key={i} class="flex items-center gap-2">
                                                                            {liker.avatar ? (
                                                                                <img class="w-4 h-4 rounded-full object-cover" src={liker.avatar} alt={liker.name} />
                                                                            ) : (
                                                                                <div class="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: emailToColor(liker.email) }}>
                                                                                    {liker.name.charAt(0).toUpperCase()}
                                                                                </div>
                                                                            )}
                                                                            <span class="text-[10px] font-medium text-quartz dark:text-quartz-light">{liker.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setReplyTo(replyTo === comment.id ? null : comment.id);
                                                        setNewComment(`@${reply.author_name} `);
                                                    }}
                                                    class="text-[11px] font-medium text-gray-400 hover:text-quartz dark:hover:text-white flex items-center gap-1 transition"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            {replyTo === comment.id && user && (
                                <div class="pl-11 mt-4">
                                    <form onSubmit={handleSubmit}>
                                        <textarea
                                            value={newComment}
                                            onInput={(e) => setNewComment((e.target as HTMLTextAreaElement).value)}
                                            placeholder="Write a reply..."
                                            class="w-full bg-transparent border-2 border-gray-300/40 dark:border-gray-600/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 rounded-lg p-2 outline-none min-h-[60px] resize-y text-sm transition-all"
                                            autoFocus
                                        />
                                        <div class="flex justify-end gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => { setReplyTo(null); setNewComment(""); }}
                                                class="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim()}
                                                class="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition"
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Avatar Lightbox Modal */}
            {previewAvatar && (
                <div
                    class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 pointer-events-auto"
                    onClick={() => setPreviewAvatar(null)}
                >
                    <button
                        class="absolute top-6 right-6 text-white hover:text-red-500 transition-colors bg-white/10 p-2 rounded-full"
                        onClick={(e) => { e.stopPropagation(); setPreviewAvatar(null); }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="max-w-[90vw] max-h-[90vh] relative shadow-2xl rounded-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
                        <img
                            src={previewAvatar}
                            alt="Avatar preview"
                            class="w-full h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
