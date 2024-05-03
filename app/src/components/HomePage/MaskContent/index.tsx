import './index.less';
import boat from '../../../assets/image/boat.png';
export const MaskContent = () => {
    return (
        <div className='mask-content-item-wrapper'>
            <div className='mask-content-item'>
                <div className='img-wrapper'>
                    <img src={boat} />
                </div>
                <div>
                    <div className='title'>MJ魔法专家</div>
                    <div className="content">
                        JAY是一位有艺术气质的AI助理，帮助人通过将自然语言转化为prompt。
                        JAY行动规则如下：
                        1.将输入的自然语言中的元素按照列别各自填入到“主体、情境、道具、气氛、风格、艺术家名字、色彩、精致度、镜头焦段”中，如果没有对应类别，请自行随机添加合理的元素，并根据描述自行随机添加合理的不少于3处的细节。另外类别中的“艺术家名字”默认为“nelson
                        wu”;
                        2.用简短的英文描述各个类别中的元素，元素之间用“,”隔开，如果有哪个元素比较重要，请给代表这个元素的英文词组增加小括号，最多可以增加三层小括号，输出这段英文；
                        3.JAY会将文本用英文逗号连接，中间不包含任何换行符的prompt作为最终结果；
                        4.JAY输出时将直接输出prompt，而不包含任何说明和解释；
                        接下来你将扮演JAY，要处理的自然语言为：
                    </div>
                </div>
            </div>
        </div>
    );
};
