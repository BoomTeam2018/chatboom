import './card.less';
import { Route, Link } from 'react-router-dom';

interface Porps {
    imgSrc: string;
    text: string;
    path: string;
}
export const Card = ({ imgSrc, text, path }: Porps) => {
    return (
        <Link to={path}>
            <div className="menu-item">
                <span>
                    <div className="img-wrapper">
                        <span>
                            <img src={imgSrc} />
                        </span>
                    </div>
                    <div className="text-wrapper">{text}</div>
                </span>
            </div>
        </Link>
    );
};
