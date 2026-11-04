import { Camera, ImageOff } from 'lucide-react-native';
import { Linking } from 'react-native';

import { Dialog } from '@/components/ui/dialog';
import type { PhotoPermission } from '@/hooks/use-report-photo';

export function PhotoPermissionDialog({
  prompt,
  onClose,
}: {
  prompt: PhotoPermission;
  onClose: () => void;
}) {
  const camera = prompt === 'camera';
  return (
    <Dialog
      visible={prompt !== null}
      tone="warning"
      icon={(color) =>
        camera ? (
          <Camera size={26} color={color} />
        ) : (
          <ImageOff size={26} color={color} />
        )
      }
      title={camera ? 'Camera access needed' : 'Photo access needed'}
      message={
        camera
          ? 'Allow camera access in Settings to take a report photo.'
          : 'Allow photo access in Settings to choose a photo, or take one with the camera instead.'
      }
      confirmLabel="Open settings"
      cancelLabel="Not now"
      onConfirm={() => {
        onClose();
        void Linking.openSettings();
      }}
      onCancel={onClose}
    />
  );
}
