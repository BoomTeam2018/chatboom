import Header from './SearchCom';
import { MaskContent } from './MaskContent';
import './index.less';

export const HomePage = () => {
    return (
        <div className='home-page'>
            <Header />
            <div className='mask-content-wrapper'>
                <MaskContent />
            </div>
        </div>
    );
};
