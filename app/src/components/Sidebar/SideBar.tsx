import { Card } from './Card';
import chat from '../../assets/image/chat.jpg';
import home from '../../assets/image/home.jpg';
import './sideBar.less';

function SideBar({}) {
    const list = [
        { text: '首页', imgSrc: home, path: '/home' },
        { text: '对话', imgSrc: chat, path: '/chat' }
    ];
    return (
        <div className="side-bar-wrapper">
            {list.map(item => {
                return <Card text={item.text} imgSrc={item.imgSrc} path={item.path} />;
            })}
        </div>
    );
}

export default SideBar;
