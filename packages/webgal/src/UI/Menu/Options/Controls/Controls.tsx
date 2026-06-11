import { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/UI/Menu/Options/options.module.scss';
import keyStyles from './controls.module.scss';
import { NormalButton } from '@/UI/Menu/Options/NormalButton';
import { setOptionData } from '@/store/userDataReducer';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useTrans from '@/hooks/useTrans';
import { IKeyBinding, IKeyBindings } from '@/store/userDataInterface';
import useSoundEffect from '@/hooks/useSoundEffect';

/** 默认快捷键配置 */
const defaultKeyBindings: IKeyBindings = {
  panic: { primaryKey: 'Escape', altKey: 'Backquote' },
  back: { primaryKey: 'Escape', altKey: '' },
  skip: { primaryKey: 'Control', altKey: '' },
  nextSentence: { primaryKey: 'Space', altKey: 'Enter' },
  toggleFullScreen: { primaryKey: 'F11', altKey: '' },
};

/** 按键名称显示映射 */
const keyCodeToDisplay: Record<string, string> = {
  Escape: 'Esc',
  Backquote: '`',
  Control: 'Ctrl',
  Space: 'Space',
  Enter: 'Enter',
  F11: 'F11',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  AltLeft: 'Alt',
  AltRight: 'Alt',
  ControlLeft: 'Ctrl',
  ControlRight: 'Ctrl',
  MetaLeft: 'Win',
  MetaRight: 'Win',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Backspace: 'Bksp',
  Delete: 'Del',
  Tab: 'Tab',
  CapsLock: 'Caps',
  Insert: 'Ins',
  Home: 'Home',
  End: 'End',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  NumpadEnter: 'Num Enter',
};

function getDisplayKey(keyCode: string, t: (key: string) => string): string {
  if (!keyCode) return t('keyLabels.none');
  if (keyCodeToDisplay[keyCode]) return keyCodeToDisplay[keyCode];
  if (/^F\d+$/.test(keyCode)) return keyCode;
  if (/^Digit(\d)$/.test(keyCode)) return keyCode.replace('Digit', '');
  if (/^Key([A-Z])$/.test(keyCode)) return keyCode.replace('Key', '');
  if (/^Numpad(\d)$/.test(keyCode)) return `Num ${keyCode.replace('Numpad', '')}`;
  return keyCode;
}

interface KeySlotProps {
  value: string;
  onChange: (newKey: string) => void;
  isModified: boolean;
  onReset: () => void;
}

const KeySlot: FC<KeySlotProps> = ({ value, onChange, isModified, onReset }) => {
  const [listening, setListening] = useState(false);
  const t = useTrans('menu.options.pages.controls.options.');
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!listening) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setListening(false);
        return;
      }
      onChange(e.code);
      setListening(false);
    },
    [listening, onChange],
  );

  useEffect(() => {
    if (listening) {
      document.addEventListener('keydown', handleKeyDown, true);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [listening, handleKeyDown]);

  useEffect(() => {
    if (!listening) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setListening(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [listening]);

  return (
    <div className={keyStyles.keySlotGroup}>
      {isModified && (
        <div
          className={keyStyles.keyResetBtn}
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
        >
          <i className="bi bi-arrow-counterclockwise" />
        </div>
      )}
      <div
        ref={ref}
        className={`${keyStyles.keySlot} ${listening ? keyStyles.keySlotActive : ''}`}
        onClick={() => setListening(true)}
      >
        {listening ? '...' : getDisplayKey(value, t)}
      </div>
    </div>
  );
};

export function Controls() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const t = useTrans('menu.options.pages.controls.options.');
  const { playSeSwitch } = useSoundEffect();

  const keyBindings: IKeyBindings = userDataState.optionData.keyBindings || defaultKeyBindings;

  const updateKeyBinding = (action: keyof IKeyBindings, field: 'primaryKey' | 'altKey', newKey: string) => {
    const currentBinding = { ...keyBindings[action] };
    const otherField = field === 'primaryKey' ? 'altKey' : 'primaryKey';
    const updatedBindings: IKeyBindings = { ...keyBindings };

    if (newKey && newKey === currentBinding[otherField]) {
      const tmp = currentBinding[field];
      currentBinding[field] = newKey;
      currentBinding[otherField] = tmp;
    } else {
      currentBinding[field] = newKey;
    }

    updatedBindings[action] = currentBinding;
    dispatch(setOptionData({ key: 'keyBindings', value: updatedBindings }));
    setStorage();
  };

  const resetKeyBindings = () => {
    playSeSwitch();
    dispatch(setOptionData({ key: 'keyBindings', value: { ...defaultKeyBindings } }));
    setStorage();
  };

  const resetSingleKey = (action: keyof IKeyBindings, field: 'primaryKey' | 'altKey') => {
    playSeSwitch();
    const updatedBindings: IKeyBindings = { ...keyBindings };
    updatedBindings[action] = { ...keyBindings[action], [field]: defaultKeyBindings[action][field] };
    dispatch(setOptionData({ key: 'keyBindings', value: updatedBindings }));
    setStorage();
  };

  const bindingItems: { key: keyof IKeyBindings; label: string }[] = [
    { key: 'back', label: t('back.title') },
    { key: 'skip', label: t('skip.title') },
    { key: 'nextSentence', label: t('nextSentence.title') },
    { key: 'toggleFullScreen', label: t('toggleFullScreen.title') },
  ];

  return (
    <div className={styles.Options_main_content_half}>
      <div className={keyStyles.controlsTopBar}>
        <div className={keyStyles.controlsHint}>{t('tips')}</div>
        <div className={keyStyles.controlsReset}>
          <NormalButton
            textList={[t('resetKeys')]}
            functionList={[resetKeyBindings]}
            currentChecked={-1}
          />
        </div>
      </div>
      <div className={keyStyles.controlsList}>
        {bindingItems.map(({ key, label }) => (
          <div key={key} className={keyStyles.controlsRow}>
            <div className={keyStyles.controlsRowTitle}>{label}</div>
            <div className={keyStyles.controlsRowKeys}>
              <KeySlot
                value={keyBindings[key].primaryKey}
                onChange={(newKey) => updateKeyBinding(key, 'primaryKey', newKey)}
                isModified={keyBindings[key].primaryKey !== defaultKeyBindings[key].primaryKey}
                onReset={() => resetSingleKey(key, 'primaryKey')}
              />
              <KeySlot
                value={keyBindings[key].altKey}
                onChange={(newKey) => updateKeyBinding(key, 'altKey', newKey)}
                isModified={keyBindings[key].altKey !== defaultKeyBindings[key].altKey}
                onReset={() => resetSingleKey(key, 'altKey')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
