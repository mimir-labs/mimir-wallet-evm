// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TRANSITION_EASINGS } from '@nextui-org/framer-utils';
import { Overlay } from '@react-aria/overlays';
import { AnimatePresence, domAnimation, LazyMotion, motion } from 'framer-motion';
import React from 'react';

interface Props {
  isOpen: boolean;
  placement?: 'left' | 'right';
  className?: string;
  rounded?: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

function Drawer({ rounded, placement = 'left', isOpen, className, onClose, children }: Props): React.ReactElement {
  const backdrop = (
    <LazyMotion features={domAnimation}>
      <motion.div
        animate='enter'
        exit='exit'
        initial='exit'
        variants={{
          enter: {
            opacity: 1,
            transition: {
              opacity: {
                duration: 0.4,
                ease: TRANSITION_EASINGS.ease
              }
            }
          },
          exit: {
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: TRANSITION_EASINGS.ease
            }
          }
        }}
        className='z-50 fixed left-0 right-0 bottom-0 top-0 bg-foreground/30'
        onClick={onClose}
      />
    </LazyMotion>
  );

  const overlay = (
    <Overlay disableFocusManagement portalContainer={document.body}>
      <div>
        {backdrop}

        <LazyMotion features={domAnimation}>
          <motion.div
            animate='enter'
            exit='exit'
            initial='exit'
            variants={
              placement === 'left'
                ? {
                    enter: {
                      translateX: '0%',
                      opacity: 1,
                      transition: {
                        opacity: {
                          duration: 0.4,
                          ease: TRANSITION_EASINGS.ease
                        },
                        translateX: {
                          type: 'spring',
                          bounce: 0,
                          duration: 0.6
                        }
                      }
                    },
                    exit: {
                      translateX: '-20%',
                      opacity: 0,
                      transition: {
                        duration: 0.3,
                        ease: TRANSITION_EASINGS.ease
                      }
                    }
                  }
                : {
                    enter: {
                      translateX: '0%',
                      opacity: 1,
                      transition: {
                        opacity: {
                          duration: 0.4,
                          ease: TRANSITION_EASINGS.ease
                        },
                        translateX: {
                          type: 'spring',
                          bounce: 0,
                          duration: 0.6
                        }
                      }
                    },
                    exit: {
                      translateX: '20%',
                      opacity: 0,
                      transition: {
                        duration: 0.3,
                        ease: TRANSITION_EASINGS.ease
                      }
                    }
                  }
            }
            data-placement={placement}
            className={'z-50 fixed top-0 bottom-0 bg-background shadow-medium'
              .concat(placement === 'left' ? ' left-0' : ' right-0')
              .concat(
                rounded
                  ? ' data-[placement=right]:rounded-tl-large data-[placement=right]:rounded-bl-large data-[placement=left]:rounded-tr-large data-[placement=left]:rounded-br-large'
                  : ''
              )
              .concat(` ${className || ''}`)}
          >
            {children}
          </motion.div>
        </LazyMotion>
      </div>
    </Overlay>
  );

  return <AnimatePresence>{isOpen ? overlay : null}</AnimatePresence>;
}

export default React.memo(Drawer);
