const jp = {
  // 通用
  common: {
    yes: 'はい',
    no: 'いいえ',
  },

  menu: {
    options: {
      title: 'CONFIG',
      pages: {
        system: {
          title: 'システム',
          options: {
            autoSpeed: {
              title: '自動再生速度',
              options: {
                slow: '遅く',
                medium: '標準',
                fast: '速く',
              },
            },
            language: {
              title: '言語',
            },
            resetData: {
              title: 'データの復元と削除',
              options: {
                clearGameSave: 'すべてのセーブデータを削除',
                resetSettings: '設定を元に戻す',
                clearAll: 'すべてのデータを削除',
              },
              dialogs: {
                clearGameSave: 'すべてのセーブデータを削除しますか？',
                resetSettings: '設定を元に戻しますか？',
                clearAll: 'すべてのデータを削除しますか？',
              },
            },
            gameSave: {
              title: 'セーブデータと設定のインポートとエクスポート',
              options: {
                export: 'セーブデータと設定のエクスポート',
                import: 'セーブデータと設定のインポート',
              },
              dialogs: {
                import: {
                  title: 'セーブデータと設定をインポートしますか？',
                  tip: 'セーブデータのインポート',
                  error: 'セーブデータの読み込みに失敗しました',
                },
              },
            },
            about: {
              title: 'WebGAL について',
              subTitle: 'WebGAL エンジンの一つのフォーク',
              version: 'バージョン',
              sourceK: 'ソースコードリポジトリ',
              source: '元のリポジトリ',
              // contributors: '貢献者',
              website: 'ウェブサイト',
            },
            skipAll: {
              title: 'スキップモード',
              options: {
                read: '既読',
                all: 'すべて',
              }
            }
          },
        },
        display: {
          title: 'ウィンドウ',
          options: {
            fullScreen: {
              title: 'フルスクリーン',
              options: {
                on: 'オン',
                off: 'オフ',
              },
            },
            textSpeed: {
              title: 'テキスト表示速度',
              options: {
                slow: '遅く',
                medium: '標準',
                fast: '速く',
              },
            },
            textSize: {
              title: 'テキストサイズ',
              options: {
                small: '小',
                medium: '中',
                large: '大',
              },
            },
            /* textFont: {
              title: 'フォント',
              options: {
                WebgalUI: 'UI ゴシック',
                WebgalUITitle: 'UI 明朝',
                WebgalStageDisplay: '演出明朝',
              },
            }, */
            textboxOpacity: {
              title: 'テキストボックスの不透明度',
            },
            highlightReadText: {
              title: '既読テキストのハイライト',
              options: {
                on: 'オン',
                off: 'オフ',
              },
            },
            tabletMode: {
              title: 'タブレットモード',
              options: {
                on: 'オン',
                off: 'オフ',
              },
            },
            textPreview: {
              title: 'テキスト表示プレビュー',
              text: 'これはテキストボックスのフォントとサイズ、表示速度のプレビューです。上にある設定で変更できます。',
            },
          },
        },
        sound: {
          title: 'サウンド',
          options: {
            volumeMain: { title: 'メイン音量' },
            vocalVolume: { title: 'ボイス音量' },
            bgmVolume: { title: 'BGM 音量' },
            seVolume: { title: '効果音音量' },
            uiSeVolume: { title: 'UI 効果音音量' },
            voiceOption: { title: 'ボイスの中断' },
            voiceStop: { title: '中断する' },
            voiceContinue: { title: '中断しない' },
          },
        },
        controls: {
          title: '操作',
          options: {
            panic: {
              title: 'パニックオーバーレイ',
              primaryKey: '主キー',
              altKey: '代替キー',
            },
            back: {
              title: '戻る',
              primaryKey: '主キー',
              altKey: '代替キー',
            },
            skip: {
              title: 'スキップ',
              primaryKey: '主キー',
              altKey: '代替キー',
            },
            nextSentence: {
              title: '次のセリフ',
              primaryKey: '主キー',
              altKey: '代替キー',
            },
            toggleFullScreen: {
              title: 'フルスクリーン切替',
              primaryKey: '主キー',
              altKey: '代替キー',
            },
            openBacklog: {
              title: 'バックログを開く',
            },
            closeBacklog: {
              title: 'バックログを閉じる',
            },
            fastForward: {
              title: '早送り',
            },
            resetKeys: 'デフォルトに戻す',
            keyLabels: {
              Escape: 'Esc',
              Backquote: '`',
              Control: 'Ctrl',
              Space: 'Space',
              Enter: 'Enter',
              F11: 'F11',
              none: 'なし',
            },
            tips: 'キースロットをクリックして新しいキーを押して変更\nタッチ: 長押しでリセット、マウス: ホバー後にリセットボタンをクリック',
          },
        },
        // language: {
        //   title: '言語',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'SAVE',
      isOverwrite: 'セーブデータを上書きしますか？',
    },
    loadSaving: {
      title: 'LOAD',
    },
    title: {
      title: 'HOME',
    },
    exit: {
      title: 'BACK',
    },
  },

  title: {
    start: {
      title: '最初から',
      subtitle: '',
    },
    continue: {
      title: '続きから',
      noSaving: 'セーブデータなし',
      subtitle: '',
    },
    options: {
      title: 'システム設定',
      subtitle: '',
    },
    load: {
      title: 'ロード',
      subtitle: '',
    },
    extra: {
      title: 'ギャラリー',
      subtitle: '',
    },
    exit: {
      title: 'ゲーム終了',
      subtitle: '',
    },
  },

  gaming: {
    noSaving: 'クイックセーブなし',
    buttons: {
      hide: 'CLOSE',
      show: 'SHOW',
      backlog: 'LOG',
      replay: 'REPLAY',
      auto: 'AUTO',
      forward: 'SKIP',
      quicklySave: 'Q·SAVE',
      quicklyLoad: 'Q·LOAD',
      save: 'SAVE',
      load: 'LOAD',
      options: 'SYSTEM',
      title: 'TITLE',
      titleTips: 'タイトル画面に戻りますか？',
      exitTips: 'ゲームを終了しますか',
      qsTips: 'クイックセーブを上書きします',
      qlTips: 'クイックセーブを読み込みます',
    },
  },

  extra: {
    title: 'ギャラリー',
  },
};

export default jp;
