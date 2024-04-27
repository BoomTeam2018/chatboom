import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button.tsx';
import {
    ChevronRight,
    FolderKanban,
    Newspaper,
    Shield,
    Users2
} from 'lucide-react';
import router from '@/router.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog.tsx';
import { selectAdmin, selectAuthenticated } from '@/store/auth.ts';
import {
    infoArticleSelector,
    infoAuthFooterSelector,
    infoContactSelector,
    infoFooterSelector,
    infoGenerationSelector
} from '@/store/info.ts';
import Markdown from '@/components/Markdown.tsx';
import { hitGroup } from '@/utils/groups.ts';
import { selectModel, selectSupportModels } from '@/store/chat.ts';
import { SimpleModelItem } from '@/components/home/ModelMarket.tsx';

function Footer() {
    const auth = useSelector(selectAuthenticated);
    const footer = useSelector(infoFooterSelector);
    const auth_footer = useSelector(infoAuthFooterSelector);

    if (auth && auth_footer) {
        return null;
    }

    return footer.length > 0 && <Markdown acceptHtml={true}>{footer}</Markdown>;
}

function ModelTextDisplay() {
    const textInfo = useSelector(selectModel);
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

function ChatSpace() {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const contact = useSelector(infoContactSelector);
    const admin = useSelector(selectAdmin);

    const generationGroup = useSelector(infoGenerationSelector);
    const generation = hitGroup(generationGroup);

    const articleGroup = useSelector(infoArticleSelector);
    const article = hitGroup(articleGroup);

    const currentModelId = useSelector(selectModel);
    const supportModels = useSelector(selectSupportModels);
    const currentModel = supportModels.find(
        model => model.id === currentModelId
    );

    return (
        <div className={`chat-product`}>
            {admin && (
                <Button
                    variant={`outline`}
                    onClick={() => router.navigate('/admin')}
                >
                    <Shield className={`h-4 w-4 mr-1.5`} />
                    {t('admin.users')}
                    <ChevronRight className={`h-4 w-4 ml-2`} />
                </Button>
            )}

            {contact.length > 0 && (
                <Button variant={`outline`} onClick={() => setOpen(true)}>
                    <Users2 className={`h-4 w-4 mr-1.5`} />
                    {t('contact.title')}
                    <ChevronRight className={`h-4 w-4 ml-2`} />
                </Button>
            )}

            {article && (
                <Button
                    variant={`outline`}
                    onClick={() => router.navigate('/article')}
                >
                    <Newspaper className={`h-4 w-4 mr-1.5`} />
                    {t('article.title')}
                    <ChevronRight className={`h-4 w-4 ml-2`} />
                </Button>
            )}

            {generation && (
                <Button
                    variant={`outline`}
                    onClick={() => router.navigate('/generate')}
                >
                    <FolderKanban className={`h-4 w-4 mr-1.5`} />
                    {t('generate.title')}
                    <ChevronRight className={`h-4 w-4 ml-2`} />
                </Button>
            )}
            {currentModel && (
                <div>
                    <SimpleModelItem />
                    <ModelDisplayGrid />
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className={`flex-dialog`}>
                    <DialogHeader>
                        <DialogTitle>{t('contact.title')}</DialogTitle>
                        <DialogDescription asChild>
                            <Markdown className={`pt-4`} acceptHtml={true}>
                                {contact}
                            </Markdown>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <div className={`space-footer`}>
                <Footer />
            </div>
        </div>
    );
}

export default ChatSpace;
