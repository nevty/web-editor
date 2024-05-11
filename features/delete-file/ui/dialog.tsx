import { useUnit } from 'effector-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui';
import { DELETE_DIALOG_TEXT } from '../lib';
import { FileDeletionModel } from '../model';

export const FileDeletionDialog = ({ model }: { model: FileDeletionModel }) => {
  const dialog = useUnit(model.$dialog);
  const [confirm, cancel] = useUnit([model.confirm, model.cancel]);

  return (
    <AlertDialog
      open={Boolean(dialog)}
      onOpenChange={(isOpen) => isOpen && cancel()}
    >
      {dialog && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DELETE_DIALOG_TEXT.TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {DELETE_DIALOG_TEXT.DESCRIPTION(dialog.type)}{' '}
              <b>{dialog.fileName}</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => confirm(dialog)}
              variant="destructive"
            >
              {DELETE_DIALOG_TEXT.CONFIRM}
            </AlertDialogAction>
            <AlertDialogCancel onClick={cancel}>
              {DELETE_DIALOG_TEXT.CANCEL}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
};
