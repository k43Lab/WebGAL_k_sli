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

/** 当前正在等待录入按键的 KeySlot 实例集合，供 useBack 等热键钩子判断是否应跳过处理 */
export const listeningKeySlots = new Set<object>();

/** 默认快捷键配置 */
const defaultKeyBindings: IKeyBindings = {
  panic: { primaryKey: 'Escape', altKey: 'Backquote', thirdKey: '' },
  back: { primaryKey: 'Escape', altKey: '', thirdKey: '' },
  skip: { primaryKey: 'Control', altKey: '', thirdKey: '' },
  nextSentence: { primaryKey: 'Space', altKey: 'Enter', thirdKey: 'Mouse1' },
  toggleFullScreen: { primaryKey: 'F11', altKey: '', thirdKey: '' },
  openBacklog: { primaryKey: 'WheelUp', altKey: '', thirdKey: '' },
  closeBacklog: { primaryKey: 'WheelDown', altKey: '', thirdKey: '' },
  fastForward: { primaryKey: 'WheelDown', altKey: '', thirdKey: '' },
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
  Mouse1: 'Mouse1',
  Mouse2: 'Mouse2',
  WheelUp: 'Wheel↑',
  WheelDown: 'Wheel↓',
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
  const slotId = useRef<object>({});

  // 注册/注销当前 KeySlot 的监听状态
  useEffect(() => {
    if (listening) {
      listeningKeySlots.add(slotId.current);
    } else {
      listeningKeySlots.delete(slotId.current);
    }
    return () => { listeningKeySlots.delete(slotId.current); };
  }, [listening]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!listening) return;
      e.preventDefault();
      e.stopPropagation();
      onChange(e.code);
      setListening(false);
    },
    [listening, onChange],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!listening) return;
      e.preventDefault();
      e.stopPropagation();
      onChange(`Mouse${e.button + 1}`);
      setListening(false);
    },
    [listening, onChange],
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!listening) return;
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY < 0 ? 'WheelUp' : 'WheelDown';
      onChange(direction);
      setListening(false);
    },
    [listening, onChange],
  );

  useEffect(() => {
    if (listening) {
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('mousedown', handleMouseDown, true);
      document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('wheel', handleWheel, true);
    };
  }, [listening, handleKeyDown, handleMouseDown, handleWheel]);

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
      <div
        ref={ref}
        className={`${keyStyles.keySlot} ${listening ? keyStyles.keySlotActive : ''} ${isModified ? keyStyles.keySlotModified : ''}`}
        onClick={() => setListening((v) => !v)}
      >
        {listening ? (
          <>
            {'> '}
            <span className={keyStyles.keySlotHighlight}>{getDisplayKey(value, t)}</span>
            {' <'}
          </>
        ) : (
          getDisplayKey(value, t)
        )}
      </div>
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
    </div>
  );
};

export function Controls() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const t = useTrans('menu.options.pages.controls.options.');
  const { playSeSwitch } = useSoundEffect();

  const keyBindings: IKeyBindings = userDataState.optionData.keyBindings || defaultKeyBindings;

  const updateKeyBinding = (action: keyof IKeyBindings, field: 'primaryKey' | 'altKey' | 'thirdKey', newKey: string) => {
    const currentBinding = { ...keyBindings[action] };
    const fields: ('primaryKey' | 'altKey' | 'thirdKey')[] = ['primaryKey', 'altKey', 'thirdKey'];
    const otherFields = fields.filter((f) => f !== field);
    const updatedBindings: IKeyBindings = { ...keyBindings };

    // 如果新键与其他槽位重复，交换
    for (const other of otherFields) {
      if (newKey && newKey === currentBinding[other]) {
        currentBinding[other] = currentBinding[field];
        break;
      }
    }
    currentBinding[field] = newKey;

    updatedBindings[action] = currentBinding;
    dispatch(setOptionData({ key: 'keyBindings', value: updatedBindings }));
    setStorage();
  };

  const resetKeyBindings = () => {
    playSeSwitch();
    dispatch(setOptionData({ key: 'keyBindings', value: { ...defaultKeyBindings } }));
    setStorage();
  };

  const resetSingleKey = (action: keyof IKeyBindings, field: 'primaryKey' | 'altKey' | 'thirdKey') => {
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
    { key: 'openBacklog', label: t('openBacklog.title') },
    { key: 'closeBacklog', label: t('closeBacklog.title') },
    { key: 'fastForward', label: t('fastForward.title') },
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
              <KeySlot
                value={keyBindings[key].thirdKey}
                onChange={(newKey) => updateKeyBinding(key, 'thirdKey', newKey)}
                isModified={keyBindings[key].thirdKey !== defaultKeyBindings[key].thirdKey}
                onReset={() => resetSingleKey(key, 'thirdKey')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
