// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import IconDownload from '@mimir-wallet/assets/svg/icon-download.svg?react';
import { Button } from '@mimir-wallet/components';

import { generateExampleCsv } from './parse';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

function Upload({ onUpload, accept = '*', multiple = false, maxSize = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        if (file.size > maxSize * 1024 * 1024) {
          setError(`文件 ${file.name} 太大。最大限制 ${maxSize}MB`);

          return false;
        }
      }

      setError(null);

      return true;
    },
    [maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);

      if (validateFiles(files)) {
        onUpload(multiple ? files : [files[0]]);
      }
    },
    [multiple, onUpload, validateFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      if (validateFiles(files)) {
        onUpload(multiple ? files : [files[0]]);
      }
    },
    [multiple, onUpload, validateFiles]
  );

  return (
    <div className='w-full mx-auto px-2.5 py-3 bg-secondary rounded-medium'>
      <div
        data-dragging={isDragging}
        className='relative p-8 border-2 border-dashed rounded-lg cursor-pointer space-y-5 border-transparent data-[dragging=true]:border-primary transition-all duration-300 ease-in-out'
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type='file'
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />

        <div className='text-center space-y-5'>
          <div className='flex justify-center'>
            <svg width='36' height='44' viewBox='0 0 36 44' fill='none'>
              <path
                d='M26 0L36 11V41.8176C35.9989 43.0232 35.1101 44 34.014 44H1.986C0.893103 43.9916 0.00870777 43.0197 0 41.8176V2.18249C0 0.976851 0.890017 0 1.986 0H26ZM16 19.8H9.99999V24.2H16V30.8H20V24.2H26V19.8H20V13.2H16V19.8Z'
                fill='#5F45FF'
              />
            </svg>
          </div>

          <p className='mb-2 text-lg font-semibold text-foreground'>Drag files here or click to upload</p>

          <Button
            endContent={<IconDownload />}
            variant='bordered'
            size='sm'
            color='primary'
            onClick={generateExampleCsv}
          >
            Download example csv
          </Button>
        </div>
      </div>

      {error && <div className='mt-2 text-sm text-danger'>{error}</div>}
    </div>
  );
}

export default React.memo(Upload);
