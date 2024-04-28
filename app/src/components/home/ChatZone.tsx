import { useSelector } from 'react-redux';
import { selectModel, selectSupportModels } from '@/store/chat.ts';
import { SimpleModelItem } from '@/components/home/ModelMarket.tsx';

function ModelTextDisplay() {
    const currentModelId = useSelector(selectModel);
    const supportModels = useSelector(selectSupportModels);
    const currentModel = supportModels.find(
        model => model.id === currentModelId
    );
    const textInfo = currentModel?.suggestedInputs || 'No suggested inputs.';
    return (
        <div className="border p-4 border-gray-300 rounded-lg">
            <p>{textInfo}</p>
        </div>
    );
}

function ModelDisplayGrid() {
    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <ModelTextDisplay />
            <ModelTextDisplay />
            <ModelTextDisplay />
            <ModelTextDisplay />
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
                    <div className="filler"></div> {/* 上方的填充容器 */}
                    <SimpleModelItem />
                    <div className="filler"></div> {/* 下方的填充容器 */}
                    <div style={{ width: '100%' }}>
                        <ModelDisplayGrid />
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatZone;
