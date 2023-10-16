import { FC, HTMLAttributeAnchorTarget, ReactNode } from 'react';

export interface ExternalLinkProps {
    children: ReactNode;
    href?: string;
    target?: HTMLAttributeAnchorTarget;
    title: string;
}

/** A link to an external site. */
const ExternalLink: FC<ExternalLinkProps> = (props) => {
    const { href, children, target, title } = props;

    return (
        <a
            href={href}
            rel="noreferrer noopener"
            target={target ?? '_self'}
            style={{ color: 'inherit', textDecoration: 'inherit' }}
            title={title}
        >
            {children}
        </a>
    );
};

export default ExternalLink;
