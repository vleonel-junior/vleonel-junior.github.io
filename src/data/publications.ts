
export interface PublicationItem {
    title: string;
    journal?: string;
    year: string;
    url?: string;
    authors: string;
}

// Section is hidden on the home page while this list is empty
export const publicationsData: PublicationItem[] = [];
