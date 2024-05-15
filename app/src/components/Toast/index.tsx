import './index.less'; // 确保创建对应的 CSS 文件
import { useTranslation } from 'react-i18next';

const Toast = () => {
    const { t } = useTranslation();

    return (
        <div>
            <div className="toast">{t('please-agree-policy')}</div>
        </div>
    );
};

export default Toast;
