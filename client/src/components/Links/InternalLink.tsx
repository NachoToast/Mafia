import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface InternalLinkProps {
    children: ReactNode;
    href: string;
    title?: string;
}

/** A link to somewhere else on the site. */
const InternalLink: FC<InternalLinkProps> = ({ href, children, title }) => (
    <Link
        to={href}
        title={title}
        style={{ color: 'inherit', textDecoration: 'inherit' }}
    >
        {children}
    </Link>
);

export default InternalLink;
