import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

type Lang = 'en' | 'fr';

const strings = {
    en: {
        error: 'Error: ',
        errorPosting: 'Error posting comment: ',
        signInToLikePost: 'Please sign in to like this post.',
        signInToLikeComment: 'Please sign in to like comments.',
        shareTitle: 'Check out this post!',
        linkCopied: 'Link copied to clipboard!',
        avatarUpdated: 'Avatar updated successfully!',
        errorAvatar: 'Error updating avatar: ',
        likedBy: 'Liked by',
        likes: 'Likes',
        comments: 'Comments',
        liked: 'Liked',
        like: 'Like',
        share: 'Share',
        discussion: 'Discussion about this post',
        linkSent: 'Verification link sent',
        linkSentTo: 'A verification link has been sent to',
        otherEmail: 'Use a different email',
        join: 'Join the discussion',
        enterEmail: 'Enter your email',
        sending: 'Sending...',
        signIn: 'Sign in with email',
        user: 'User',
        displayName: 'Display name',
        save: 'Save',
        cancel: 'Cancel',
        setName: 'Set your name',
        author: 'Author',
        editProfile: 'Edit profile',
        writeComment: 'Write a comment...',
        signOut: 'Sign out',
        postComment: 'Post Comment',
        loading: 'Loading discussion...',
        empty: 'No comments yet. Be the first to share your thoughts!',
        likedByAuthor: 'Liked by Léonel',
        reply: 'Reply',
        writeReply: 'Write a reply...',
        avatarPreview: 'Avatar preview',
    },
    fr: {
        error: 'Erreur : ',
        errorPosting: "Erreur lors de l'envoi du commentaire : ",
        signInToLikePost: 'Connectez-vous pour aimer cet article.',
        signInToLikeComment: 'Connectez-vous pour aimer les commentaires.',
        shareTitle: 'À lire : cet article',
        linkCopied: 'Lien copié dans le presse-papiers !',
        avatarUpdated: 'Photo de profil mise à jour !',
        errorAvatar: 'Erreur lors de la mise à jour de la photo : ',
        likedBy: 'Aimé par',
        likes: "J'aime",
        comments: 'Commentaires',
        liked: 'Aimé',
        like: "J'aime",
        share: 'Partager',
        discussion: 'Discussion sur cet article',
        linkSent: 'Lien de vérification envoyé',
        linkSentTo: 'Un lien de vérification a été envoyé à',
        otherEmail: 'Utiliser une autre adresse',
        join: 'Rejoindre la discussion',
        enterEmail: 'Votre adresse e-mail',
        sending: 'Envoi...',
        signIn: 'Se connecter par e-mail',
        user: 'Utilisateur',
        displayName: "Nom d'affichage",
        save: 'Enregistrer',
        cancel: 'Annuler',
        setName: 'Choisissez votre nom',
        author: 'Auteur',
        editProfile: 'Modifier le profil',
        writeComment: 'Écrire un commentaire...',
        signOut: 'Se déconnecter',
        postComment: 'Publier',
        loading: 'Chargement de la discussion...',
        empty: 'Aucun commentaire pour le moment. Soyez le premier à donner votre avis !',
        likedByAuthor: 'Aimé par Léonel',
        reply: 'Répondre',
        writeReply: 'Écrire une réponse...',
        avatarPreview: 'Aperçu de la photo de profil',
    },
} as const;

// Helper to format date relative (e.g. "2 hours ago")
function timeAgo(dateString: string, lang: Lang) {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 31536000],
        ['month', 2592000],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];
    for (const [unit, size] of units) {
        const interval = seconds / size;
        if (interval > 1) return rtf.format(-Math.floor(interval), unit);
    }
    return rtf.format(-seconds, 'second');
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

export default function CommentSection({ slug, lang = 'en' }: { slug: string; lang?: Lang }) {
    const t = strings[lang];
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
            alert(t.error + error.message);
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
            alert(t.errorPosting + error.message);
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
            alert(t.signInToLikePost);
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
                title: t.shareTitle,
                url: url
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            alert(t.linkCopied);
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

            alert(t.avatarUpdated);
        } catch (error: any) {
            alert(t.errorAvatar + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleLike = async (commentId: string) => {
        if (!user) {
            alert(t.signInToLikeComment);
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
        <div class="font-sans text-fg">
            {/* Interaction Bar (Substack Style) */}
            <div class="border-y border-border py-3 mb-10">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <div class="flex -space-x-2 overflow-hidden cursor-pointer" onClick={() => setShowLikerPanel(!showLikerPanel)}>
                                {likerAvatars.length > 0 ? (
                                    likerAvatars.map((liker, i) => (
                                        liker.avatar ? (
                                            <img key={i} class="inline-block h-8 w-8 rounded-full ring-2 ring-bg object-cover hover:scale-110 transition-transform" src={liker.avatar} alt={liker.name} title={liker.name} />
                                        ) : (
                                            <div key={i} class="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-bg text-white text-xs font-bold hover:scale-110 transition-transform" style={{ backgroundColor: emailToColor(liker.email) }} title={liker.name}>
                                                {liker.name.charAt(0).toUpperCase()}
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <div class="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center ring-2 ring-bg">
                                        <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                    </div>
                                )}
                            </div>
                            {/* Liker Panel Popover */}
                            {showLikerPanel && likerAvatars.length > 0 && (
                                <div class="absolute top-full left-0 mt-2 bg-bg rounded-xl shadow-lg border border-border p-3 z-50 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-150">
                                    <p class="text-[10px] font-bold text-fg-subtle uppercase tracking-wider mb-2">{t.likedBy}</p>
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
                                                <span class="text-xs font-medium text-fg">{liker.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div class="text-sm font-medium text-fg-subtle">
                            <span class="text-fg">{postLikes.toLocaleString()}</span> {t.likes} • <span class="text-fg">{comments.length}</span> {t.comments}
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            onClick={handlePostLike}
                            class={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-sm font-bold ${isPostLiked ? 'border-red-200 bg-red-50 text-red-600' : 'border-border hover:bg-muted'}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={isPostLiked ? "currentColor" : "none"} stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            {isPostLiked ? t.liked : t.like}
                        </button>
                        <button
                            onClick={handleShare}
                            class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border hover:bg-muted transition-all text-sm font-bold"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            {t.share}
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between mb-8">
                <h3 class="text-xl font-bold font-serif">
                    {t.discussion}
                    <span class="ml-3 text-sm font-normal text-fg-subtle bg-muted px-2 py-0.5 rounded-full">
                        {comments.length}
                    </span>
                </h3>

            </div>

            {/* Input Area */}
            {!user ? (
                <div class="bg-surface rounded-lg p-6 border border-border mb-10">
                    {loginSent ? (
                        <div class="text-center py-4">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-soft text-accent mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <h4 class="font-bold mb-1">{t.linkSent}</h4>
                            <p class="text-sm text-fg-subtle">{t.linkSentTo} <span class="font-medium text-fg">{email}</span>.</p>
                            <button onClick={() => setLoginSent(false)} class="mt-4 text-xs font-bold text-fg hover:underline">{t.otherEmail}</button>
                        </div>
                    ) : (
                        <div>
                            <p class="mb-4 text-sm font-medium text-center">{t.join}</p>
                            <form onSubmit={handleEmailLogin} class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    required
                                    placeholder={t.enterEmail}
                                    value={email}
                                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                                    class="flex-1 px-4 py-2 rounded border border-border bg-bg text-sm focus:border-accent outline-none transition shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={loginLoading || !email.trim()}
                                    class="bg-fg text-bg px-6 py-2 rounded font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loginLoading ? t.sending : t.signIn}
                                </button>
                            </form>
                            <p class="mt-4 text-[10px] text-center text-fg-subtle">
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
                                        alt={user.user_metadata.full_name || t.user}
                                        class="w-10 h-10 rounded-full border border-gray-200 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                        onClick={() => setPreviewAvatar(user.user_metadata.avatar_url)}
                                    />
                                ) : (
                                    <div class="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent text-sm font-bold">
                                        {user.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <label class="absolute -bottom-1 -right-1 bg-bg rounded-full p-1 shadow-sm border border-border cursor-pointer hover:text-accent transition-colors">
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
                                            class="text-xs border-b border-border bg-transparent outline-none focus:border-accent"
                                            placeholder={t.displayName}
                                        />
                                        <button type="button" onClick={handleUpdateName} class="text-[10px] font-bold text-accent">{t.save}</button>
                                        <button type="button" onClick={() => setIsEditingName(false)} class="text-[10px] text-fg-subtle">{t.cancel}</button>
                                    </div>
                                ) : (
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="text-xs font-bold">{displayName || t.setName}</span>
                                        {user.email === AUTHOR_EMAIL && (
                                            <span class="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-fg-subtle">
                                                {t.author}
                                            </span>
                                        )}
                                        <button type="button" onClick={() => setIsEditingName(true)} class="text-[10px] text-fg-subtle hover:text-accent transition">{t.editProfile}</button>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onInput={(e) => setNewComment((e.target as HTMLTextAreaElement).value)}
                                    placeholder={t.writeComment}
                                    class="w-full bg-transparent border-2 border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-lg p-3 outline-none min-h-[80px] resize-y text-sm transition-all"
                                />
                                <div class="flex justify-between items-center mt-2">
                                    <button type="button" onClick={handleLogout} class="text-xs text-fg-subtle hover:text-fg-muted">{t.signOut}</button>
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        class="bg-fg text-bg px-6 py-2 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition shadow-sm"
                                    >
                                        {t.postComment}
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
                    <p class="text-center text-sm text-fg-subtle animate-pulse">{t.loading}</p>
                ) : rootComments.length === 0 ? (
                    <p class="text-center text-sm text-fg-subtle italic">{t.empty}</p>
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
                                            <h4 class="text-sm font-bold text-fg">{comment.author_name}</h4>
                                            {comment.author_email === AUTHOR_EMAIL && (
                                                <span class="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-fg-subtle">
                                                    {t.author}
                                                </span>
                                            )}
                                        </div>
                                        <span class="text-xs text-fg-subtle">{timeAgo(comment.created_at, lang)}</span>
                                    </div>
                                    {authorLikes[comment.id] && (
                                        <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-100 bg-red-50 text-red-600 text-[10px] font-bold mb-2">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                            {t.likedByAuthor}
                                        </div>
                                    )}
                                    <div class="text-sm text-quartz/80 dark:text-quartz-light/80 leading-relaxed whitespace-pre-wrap mb-2">
                                        {comment.content}
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <button
                                            onClick={() => handleLike(comment.id)}
                                            class={`text-xs font-medium flex items-center gap-1 transition ${userCommentLikes[comment.id] ? 'text-red-500 hover:text-red-600' : 'text-fg-subtle hover:text-fg'}`}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill={userCommentLikes[comment.id] ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                            Like {comment.likes > 0 && `(${comment.likes})`}
                                        </button>
                                        {commentLikerMap[comment.id] && commentLikerMap[comment.id].length > 0 && (
                                            <div class="relative">
                                                <div class="flex -space-x-1.5 items-center cursor-pointer" onClick={() => setShowCommentLikerPanel(showCommentLikerPanel === comment.id ? null : comment.id)} title={commentLikerMap[comment.id].map(l => l.name).join(', ')}>
                                                    {commentLikerMap[comment.id].slice(0, 3).map((liker, i) => (
                                                        liker.avatar ? (
                                                            <img key={i} class="w-5 h-5 rounded-full ring-1 ring-bg object-cover hover:scale-110 transition-transform" src={liker.avatar} alt={liker.name} />
                                                        ) : (
                                                            <div key={i} class="w-5 h-5 rounded-full ring-1 ring-bg flex items-center justify-center text-white text-[8px] font-bold hover:scale-110 transition-transform" style={{ backgroundColor: emailToColor(liker.email) }}>
                                                                {liker.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )
                                                    ))}
                                                    {commentLikerMap[comment.id].length > 3 && (
                                                        <span class="text-[10px] text-fg-subtle ml-1">+{commentLikerMap[comment.id].length - 3}</span>
                                                    )}
                                                </div>
                                                {showCommentLikerPanel === comment.id && (
                                                    <div class="absolute bottom-full left-0 mb-2 bg-bg rounded-xl shadow-lg border border-border p-3 z-50 min-w-[180px]">
                                                        <p class="text-[10px] font-bold text-fg-subtle uppercase tracking-wider mb-2">{t.likedBy}</p>
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
                                                                    <span class="text-[11px] font-medium text-fg">{liker.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                            class="text-xs font-medium text-fg-subtle hover:text-fg flex items-center gap-1 transition"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                            {t.reply}
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
                                                    <h4 class="text-xs font-bold text-fg">{reply.author_name}</h4>
                                                    {reply.author_email === AUTHOR_EMAIL && (
                                                        <span class="text-[9px] font-bold bg-muted px-1 py-0.5 rounded text-fg-subtle">
                                                            {t.author}
                                                        </span>
                                                    )}
                                                </div>
                                                <span class="text-[10px] text-fg-subtle">{timeAgo(reply.created_at, lang)}</span>
                                            </div>
                                            {authorLikes[reply.id] && (
                                                <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-100 bg-red-50 text-red-600 text-[10px] font-bold mb-2">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                    {t.likedByAuthor}
                                                </div>
                                            )}
                                            <div class="text-sm text-quartz/80 dark:text-quartz-light/80 leading-relaxed whitespace-pre-wrap mb-2">
                                                {reply.content}
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleLike(reply.id)}
                                                    class={`text-[11px] font-medium flex items-center gap-1 transition ${userCommentLikes[reply.id] ? 'text-red-500 hover:text-red-600' : 'text-fg-subtle hover:text-fg'}`}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill={userCommentLikes[reply.id] ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                    Like {reply.likes > 0 && `(${reply.likes})`}
                                                </button>
                                                {commentLikerMap[reply.id] && commentLikerMap[reply.id].length > 0 && (
                                                    <div class="relative">
                                                        <div class="flex -space-x-1 items-center cursor-pointer" onClick={() => setShowCommentLikerPanel(showCommentLikerPanel === reply.id ? null : reply.id)} title={commentLikerMap[reply.id].map(l => l.name).join(', ')}>
                                                            {commentLikerMap[reply.id].slice(0, 3).map((liker, i) => (
                                                                liker.avatar ? (
                                                                    <img key={i} class="w-4 h-4 rounded-full ring-1 ring-bg object-cover hover:scale-110 transition-transform" src={liker.avatar} alt={liker.name} />
                                                                ) : (
                                                                    <div key={i} class="w-4 h-4 rounded-full ring-1 ring-bg flex items-center justify-center text-white text-[7px] font-bold hover:scale-110 transition-transform" style={{ backgroundColor: emailToColor(liker.email) }}>
                                                                        {liker.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )
                                                            ))}
                                                            {commentLikerMap[reply.id].length > 3 && (
                                                                <span class="text-[9px] text-fg-subtle ml-1">+{commentLikerMap[reply.id].length - 3}</span>
                                                            )}
                                                        </div>
                                                        {showCommentLikerPanel === reply.id && (
                                                            <div class="absolute bottom-full left-0 mb-2 bg-bg rounded-xl shadow-lg border border-border p-3 z-50 min-w-[160px]">
                                                                <p class="text-[10px] font-bold text-fg-subtle uppercase tracking-wider mb-2">{t.likedBy}</p>
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
                                                                            <span class="text-[10px] font-medium text-fg">{liker.name}</span>
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
                                                    class="text-[11px] font-medium text-fg-subtle hover:text-fg flex items-center gap-1 transition"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                                    {t.reply}
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
                                            placeholder={t.writeReply}
                                            class="w-full bg-transparent border-2 border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-lg p-2 outline-none min-h-[60px] resize-y text-sm transition-all"
                                            autoFocus
                                        />
                                        <div class="flex justify-end gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => { setReplyTo(null); setNewComment(""); }}
                                                class="text-xs text-fg-subtle hover:text-fg-muted px-3 py-1"
                                            >
                                                {t.cancel}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim()}
                                                class="bg-fg text-bg px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                                            >
                                                {t.reply}
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
                            alt={t.avatarPreview}
                            class="w-full h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
