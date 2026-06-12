const en = {
  // 通用
  common: {
    yes: 'OK',
    no: 'Cancel',
  },

  menu: {
    options: {
      title: 'OPTIONS',
      pages: {
        system: {
          title: 'System',
          options: {
            autoSpeed: {
              title: 'Autoplay Speed',
              options: {
                slow: 'Slow',
                medium: 'Medium',
                fast: 'Fast',
              },
            },
            language: {
              title: 'Language',
            },
            resetData: {
              title: 'Clear or Reset Data',
              options: {
                clearGameSave: 'Clear game saving',
                resetSettings: 'Reset settings',
                clearAll: 'Clear all data',
              },
              dialogs: {
                clearGameSave: 'Are you sure you want to clear game saving',
                resetSettings: 'Are you sure you want to reset all settings',
                clearAll: 'Are you sure you want to clear all data',
              },
            },
            gameSave: {
              title: 'Import or Export Game Saving and Options',
              options: {
                export: 'Export game saving and options',
                import: 'Import game saving and options',
              },
              dialogs: {
                import: {
                  title: 'Are you sure you want to import game saving and options',
                  tip: 'Import game saving',
                  error: 'Parse game saving failed',
                },
              },
            },
            about: {
              title: 'About engine',
              subTitle: 'A fork of WebGAL engine',
              version: 'Version',
              sourceK: 'Source Code Repository',
              source: 'Original Repository',
              // contributors: 'Contributors',
              website: 'Website',
            },
            skipAll: {
              title: 'Skip Mode',
              options: {
                read: 'Read',
                all: 'All',
              }
            }
          },
        },
        display: {
          title: 'Display',
          options: {
            fullScreen: {
              title: 'Full Screen',
              options: {
                on: 'ON',
                off: 'OFF',
              },
            },
            textSpeed: {
              title: 'Text Speed',
              options: {
                slow: 'Slow',
                medium: 'Medium',
                fast: 'Fast',
              },
            },
            textSize: {
              title: 'Text Size',
              options: {
                small: 'Small',
                medium: 'Medium',
                large: 'Large',
              },
            },
            /* textFont: {
              title: 'Text Font',
              options: {
                WebgalUI: 'UI Sans',
                WebgalUITitle: 'UI Serif',
                WebgalStageDisplay: 'Stage Serif',
              },
            }, */
            textboxOpacity: {
              title: 'Textbox Opacity',
            },
            highlightReadText: {
              title: 'Highlight Read Text',
              options: {
                on: 'ON',
                off: 'OFF',
              },
            },
            textPreview: {
              title: 'Preview Text Showing',
              text: "You are previewing the text's font, size and playback speed, now. You can adjust the above options according to your perception.",
            },
          },
        },
        sound: {
          title: 'Sound',
          options: {
            volumeMain: { title: 'Main Volume' },
            vocalVolume: { title: 'Vocal Volume' },
            bgmVolume: { title: 'BGM Volume' },
            seVolume: { title: 'Sound Effects Volume' },
            uiSeVolume: { title: 'UI Sound Effects Volume' },
          },
        },
        controls: {
          title: 'Controls',
          options: {
            panic: {
              title: 'Panic Overlay',
              primaryKey: 'Primary',
              altKey: 'Alternate',
            },
            back: {
              title: 'Back',
              primaryKey: 'Primary',
              altKey: 'Alternate',
            },
            skip: {
              title: 'Fast Skip',
              primaryKey: 'Primary',
              altKey: 'Alternate',
            },
            nextSentence: {
              title: 'Next Sentence',
              primaryKey: 'Primary',
              altKey: 'Alternate',
            },
            toggleFullScreen: {
              title: 'Toggle Fullscreen',
              primaryKey: 'Primary',
              altKey: 'Alternate',
            },
            openBacklog: {
              title: 'Open Backlog',
            },
            closeBacklog: {
              title: 'Close Backlog',
            },
            fastForward: {
              title: 'Fast Forward',
            },
            resetKeys: 'Reset Default',
            keyLabels: {
              Escape: 'Esc',
              Backquote: '`',
              Control: 'Ctrl',
              Space: 'Space',
              Enter: 'Enter',
              F11: 'F11',
              none: 'None',
            },
            tips: 'Click a key slot and press a new key to change\nTouch: long-press to reset; Mouse: hover then click the reset button',
          },
        },
        // language: {
        //   title: '语言',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'SAVE',
      isOverwrite: 'Are you sure you want to overwrite this save?',
    },
    loadSaving: {
      title: 'LOAD',
    },
    title: {
      title: 'TITLE',
    },
    exit: {
      title: 'BACK',
    },
  },

  title: {
    start: {
      title: 'START',
      subtitle: '',
    },
    continue: {
      title: 'CONTINUE',
      noSaving: 'No saving',
      subtitle: '',
    },
    options: {
      title: 'OPTIONS',
      subtitle: '',
    },
    load: {
      title: 'LOAD',
      subtitle: '',
    },
    extra: {
      title: 'EXTRA',
      subtitle: '',
    },
    exit: {
      title: 'EXIT',
      subtitle: '',
      tips: 'Are you sure you want to exit?',
    },
  },

  gaming: {
    noSaving: 'No saving',
    buttons: {
      hide: 'Hide',
      show: 'Show',
      backlog: 'Backlog',
      replay: 'Replay',
      auto: 'Auto',
      forward: 'Forward',
      quicklySave: 'Q·SAVE',
      quicklyLoad: 'Q·LOAD',
      save: 'SAVE',
      load: 'LOAD',
      options: 'SYSTEM',
      title: 'TITLE',
      titleTips: 'Confirm return to the title screen',
      exitTips: 'Confirm quit the game',
      qsTips: 'Overwrite previous quick save data',
      qlTips: 'Load quick save data',
    },
  },

  extra: {
    title: 'EXTRA',
  },
};

export default en;
