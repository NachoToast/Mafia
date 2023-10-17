import { FC, HTMLAttributeAnchorTarget, ReactNode } from 'react';
import './Links.css';

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
            title={title}
            className="external-link"
        >
            {children}
        </a>
    );
};

export default ExternalLink;
