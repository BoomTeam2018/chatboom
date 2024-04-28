import { useSelector } from 'react-redux';
import { selectModel, selectSupportModels } from '@/store/chat.ts';
import { SimpleModelItem } from '@/components/home/ModelMarket.tsx';

interface ModelTextDisplayProps {
    text: string;
}

function ModelTextDisplay({ text }: ModelTextDisplayProps) {
    return (
        <div className="border p-4 border-gray-300 rounded-lg">
            <p>{text}</p>
        </div>
    );
}

function ModelDisplayGrid() {
    const currentModelId = useSelector(selectModel);
    const supportModels = useSelector(selectSupportModels);
    const currentModel = supportModels.find(
        model => model.id === currentModelId
    );
    const textInfo = currentModel?.suggestedInputs || 'No suggested inputs.';

    const textParts = textInfo.split('\n'); // 这里可以根据需要改变拆分逻辑
    const displayTexts = textParts.slice(0, 4); // 只取前四个词或部分

    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            {displayTexts.map((text, index) => (
                <ModelTextDisplay key={index} text={text} />
            ))}
        </div>
    );
}

function ChatZone() {
    const currentModelId = useSelector(selectModel);
    const supportModels = useSelector(selectSupportModels);
    const currentModel = supportModels.find(
        model => model.id === currentModelId
    );

    return (
        <div className={`chat-zone`}>
            {currentModel && (
                <>
                    <div className="filler"></div>
                    {/* 上方的填充容器 */}
                    <SimpleModelItem />
                    <div className="filler"></div>
                    {/* 下方的填充容器 */}
                    <div style={{ width: '100%' }}>
                        <ModelDisplayGrid />
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatZone;
