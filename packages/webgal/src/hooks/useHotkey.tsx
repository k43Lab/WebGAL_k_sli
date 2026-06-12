import { setFastButton, startFast, stopAll, stopFast } from '@/Core/controller/gamePlay/fastSkip';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { fastSaveGame } from '@/Core/controller/storage/fastSaveLoad';
import { setStorage } from '@/Core/controller/storage/storageController';
import { WebGAL } from '@/Core/WebGAL';
import { useGenSyncRef } from '@/hooks/useGenSyncRef';
import { useMounted, useUnMounted, useUpdated } from '@/hooks/useLifeCycle';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import { setOptionData } from '@/store/userDataReducer';
import { IKeyBindings } from '@/store/userDataInterface';
import { listeningKeySlots } from '@/UI/Menu/Options/Controls/Controls';
import styles from '@/UI/Backlog/backlog.module.scss';
import throttle from 'lodash/throttle';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import useFullScreen from './useFullScreen';

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

/**
 * 从 store 获取快捷键配置
 */
function useKeyBindings(): IKeyBindings {
  const keyBindings = useGenSyncRef((state: RootState) => state.userData.optionData.keyBindings);
  return keyBindings.current || defaultKeyBindings;
}

/** useBack 刚处理过按键的标记，防止同一物理按键的 keyup 触发 usePanic */
let backJustHandled = false;

// options备用
export interface HotKeyType {
  MouseRight: {} | boolean;
  MouseWheel: {} | boolean;
  Ctrl: boolean;
  Esc:
    | {
        href: string;
        nav: 'replace' | 'push';
      }
    | boolean;
  AutoSave: {} | boolean;
}

export interface Keyboard {
  lock: (keys: string[]) => Promise<void>;
  unlock: () => Promise<void>;
}

export const keyboard: Keyboard | undefined = 'keyboard' in navigator && (navigator.keyboard as any); // FireFox and Safari not support

// export const fastSaveGameKey = `FastSaveKey`;
// export const isFastSaveKey = `FastSaveActive`;

export function useHotkey(opt?: HotKeyType) {
  useMouseRightClickHotKey();
  useMouseWheel();
  useSkip();
  usePanic();
  useBack();
  useFastSaveBeforeUnloadPage();
  useSpaceAndEnter();
  useToggleFullScreen();
}

/**
 * 右键关闭 & 打开 菜单栏
 * 当右键被绑定到其他功能时，跳过对应的右键行为
 */
export function useMouseRightClickHotKey() {
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const keyBindingsRef = useGenSyncRef((state: RootState) => state.userData.optionData.keyBindings);
  const setComponentVisibility = useSetComponentVisibility();
  const isGameActive = useGameActive<typeof GUIStore>(GUIStore);
  const isInBackLog = useIsInBackLog<typeof GUIStore>(GUIStore);
  const isOpenedDialog = useIsOpenedDialog<typeof GUIStore>(GUIStore);
  const validMenuPanelTag = useValidMenuPanelTag<typeof GUIStore>(GUIStore);
  const isShowExtra = useIsOpenedExtra<typeof GUIStore>(GUIStore);
  const handleContextMenu = useCallback((ev: MouseEvent) => {
    const kb = keyBindingsRef.current || defaultKeyBindings;
    // 检查 Mouse2 是否被绑定到其他功能
    const allBindings = [kb.openBacklog, kb.closeBacklog, kb.fastForward];
    const mouse2Bound = allBindings.some(
      (b) => b.primaryKey === 'Mouse2' || b.altKey === 'Mouse2' || b.thirdKey === 'Mouse2',
    );
    if (mouse2Bound) {
      // 右键已被绑定，不执行默认右键行为
      ev.preventDefault();
      return false;
    }
    if (isOpenedDialog()) {
      setComponentVisibility('showGlobalDialog', false);
      ev.preventDefault();
      return false;
    }
    if (isShowExtra()) {
      setComponentVisibility('showExtra', false);
    }
    if (isGameActive()) {
      setComponentVisibility('showTextBox', !GUIStore.current.showTextBox);
    }
    if (isInBackLog()) {
      setComponentVisibility('showBacklog', false);
      setComponentVisibility('showTextBox', true);
    }
    if (validMenuPanelTag()) {
      setComponentVisibility('showMenuPanel', false);
    }
    ev.preventDefault();
    return false;
  }, []);
  useMounted(() => {
    document.addEventListener('contextmenu', handleContextMenu);
  });
  useUnMounted(() => {
    document.removeEventListener('contextmenu', handleContextMenu);
  });
}

let wheelTimeout = setTimeout(() => {
  // 初始化，什么也不干
}, 0);

/**
 * 检查按键/鼠标是否匹配绑定
 */
function matchesBinding(code: string, binding?: { primaryKey?: string; altKey?: string; thirdKey?: string }): boolean {
  if (!binding) return false;
  return binding.primaryKey === code || binding.altKey === code || binding.thirdKey === code;
}

/**
 * 滚轮向上打开历史记录
 * 滚轮向下关闭历史记录
 * 滚轮向下下一句
 * 支持可配置的鼠标按键和键盘绑定
 */
export function useMouseWheel() {
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const keyBindingsRef = useGenSyncRef((state: RootState) => state.userData.optionData.keyBindings);
  const setComponentVisibility = useSetComponentVisibility();
  const isGameActive = useGameActive(GUIStore);
  const isInBackLog = useIsInBackLog(GUIStore);
  const isPanicOverlayOpen = useIsPanicOverlayOpen(GUIStore);
  const next = useCallback(
    throttle(() => {
      nextSentence();
    }, 100),
    [],
  );
  // 防止一直往下滚的时候顺着滚出历史记录
  // 问就是抄的999
  const prevDownWheelTimeRef = useRef(0);
  const handleMouseWheel = useCallback((ev) => {
    if (isPanicOverlayOpen()) return;
    const direction =
      (ev.wheelDelta && (ev.wheelDelta > 0 ? 'up' : 'down')) ||
      (ev.detail && (ev.detail < 0 ? 'up' : 'down')) ||
      'down';
    const wheelCode = direction === 'up' ? 'WheelUp' : 'WheelDown';
    const ctrlKey = ev.ctrlKey;
    const kb = keyBindingsRef.current || defaultKeyBindings;
    const dom = document.querySelector(`.${styles.backlog_content}`);

    // 检查滚轮方向是否匹配 openBacklog 绑定
    if (matchesBinding(wheelCode, kb.openBacklog) && isGameActive() && !ctrlKey) {
      setComponentVisibility('showBacklog', true);
      setComponentVisibility('showTextBox', false);
    } else if (isInBackLog() && direction === 'down' && !ctrlKey) {
      if (dom) {
        let flag = hasScrollToBottom(dom);
        let curTime = new Date().getTime();
        if (flag && curTime - prevDownWheelTimeRef.current > 100) {
          // 检查是否匹配 closeBacklog 绑定
          if (matchesBinding(wheelCode, kb.closeBacklog)) {
            setComponentVisibility('showBacklog', false);
            setComponentVisibility('showTextBox', true);
          }
        }
        prevDownWheelTimeRef.current = curTime;
      }
    } else if (matchesBinding(wheelCode, kb.fastForward) && isGameActive() && !ctrlKey) {
      clearTimeout(wheelTimeout);
      if (WebGAL.gameplay.isFast) stopFast();
      WebGAL.gameplay.isFast = true;
      setTimeout(() => {
        WebGAL.gameplay.isFast = false;
      }, 150);
      next();
    }
  }, []);

  // 鼠标按键绑定处理
  const handleMouseDown = useCallback((ev) => {
    if (isPanicOverlayOpen()) return;
    const mouseCode = `Mouse${ev.button + 1}`;
    const kb = keyBindingsRef.current || defaultKeyBindings;
    if (!kb) return;

    if (matchesBinding(mouseCode, kb.openBacklog) && isGameActive()) {
      setComponentVisibility('showBacklog', true);
      setComponentVisibility('showTextBox', false);
    } else if (matchesBinding(mouseCode, kb.closeBacklog) && isInBackLog()) {
      setComponentVisibility('showBacklog', false);
      setComponentVisibility('showTextBox', true);
    } else if (matchesBinding(mouseCode, kb.fastForward) && isGameActive()) {
      next();
    }
  }, []);

  // 键盘按键绑定处理
  const handleKeyDown = useCallback((ev) => {
    if (isPanicOverlayOpen()) return;
    if (ev.repeat) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) return;
    const code = ev.code;
    const kb = keyBindingsRef.current || defaultKeyBindings;
    if (!kb) return;

    if (matchesBinding(code, kb.openBacklog) && isGameActive()) {
      setComponentVisibility('showBacklog', true);
      setComponentVisibility('showTextBox', false);
    } else if (matchesBinding(code, kb.closeBacklog) && isInBackLog()) {
      setComponentVisibility('showBacklog', false);
      setComponentVisibility('showTextBox', true);
    } else if (matchesBinding(code, kb.fastForward) && isGameActive()) {
      next();
    }
  }, []);

  useMounted(() => {
    document.addEventListener('wheel', handleMouseWheel);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
  });
  useUnMounted(() => {
    document.removeEventListener('wheel', handleMouseWheel);
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown);
  });
}

/**
 * Panic Button, use Esc and Backquote (configurable)
 */
export function usePanic() {
  const keyBindings = useKeyBindings();
  const panicButtonList = [keyBindings.panic.primaryKey, keyBindings.panic.altKey].filter(Boolean);
  const isPanicButton = useCallback((ev: KeyboardEvent) =>
    !ev.isComposing && !ev.defaultPrevented && panicButtonList.includes(ev.code), [panicButtonList]);
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const isTitleShown = useCallback(() => GUIStore.current.showTitle, [GUIStore]);
  const isPanicOverlayOpen = useIsPanicOverlayOpen(GUIStore);
  const setComponentVisibility = useSetComponentVisibility();
  const handlePressPanicButton = useCallback((ev: KeyboardEvent) => {
    if (!isPanicButton(ev) || isTitleShown()) return;
    // 如果 useBack 刚刚处理了同一物理按键的 keydown（关闭面板），跳过本次 keyup
    if (backJustHandled) {
      backJustHandled = false;
      return;
    }
    const gui = GUIStore.current;
    if (gui.showGlobalDialog || gui.showExtra || gui.showBacklog || gui.showMenuPanel) return;
    if (isPanicOverlayOpen()) {
      setComponentVisibility('showPanicOverlay', false);
      // todo: resume
    } else {
      setComponentVisibility('showPanicOverlay', true);
      stopAll(); // despite the name, it only disables fast mode and auto mode
      // todo: pause music & animation for better performance
    }
  }, [isPanicButton]);
  useEffect(() => {
    document.addEventListener('keyup', handlePressPanicButton);
    return () => document.removeEventListener('keyup', handlePressPanicButton);
  }, [handlePressPanicButton]);
}

/**
 * 返回：按配置的返回键关闭当前打开的 UI 面板（优先级：全局对话框 > 鉴赏 > 回想 > 菜单）
 */
export function useBack() {
  const keyBindings = useKeyBindings();
  const backKeys = [keyBindings.back.primaryKey, keyBindings.back.altKey].filter(Boolean);
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const setComponentVisibility = useSetComponentVisibility();

  const handleBackKeydown = useCallback((ev: KeyboardEvent) => {
    if (!backKeys.includes(ev.code) || ev.isComposing || ev.defaultPrevented) return;
    // 正在录入按键绑定时，不拦截返回键
    if (listeningKeySlots.size > 0) return;
    // 忽略自动重复的 keydown（长按触发），防止重置 backJustHandled 标记
    if (ev.repeat) return;

    const gui = GUIStore.current;
    // 优先级：全局对话框 > 鉴赏模式 > 回想 > 菜单面板
    if (gui.showGlobalDialog) {
      setComponentVisibility('showGlobalDialog', false);
      ev.preventDefault();
      backJustHandled = true;
      return;
    }
    if (gui.showExtra) {
      setComponentVisibility('showExtra', false);
      ev.preventDefault();
      backJustHandled = true;
      return;
    }
    if (gui.showBacklog) {
      setComponentVisibility('showBacklog', false);
      setComponentVisibility('showTextBox', true);
      ev.preventDefault();
      backJustHandled = true;
      return;
    }
    if (gui.showMenuPanel) {
      setComponentVisibility('showMenuPanel', false);
      ev.preventDefault();
      backJustHandled = true;
      return;
    }
    // 没有面板需要关闭时，重置标记，允许 usePanic 正常工作
    backJustHandled = false;
  }, [backKeys]);

  useEffect(() => {
    document.addEventListener('keydown', handleBackKeydown, true);
    return () => document.removeEventListener('keydown', handleBackKeydown, true);
  }, [handleBackKeydown]);
}

/**
 * ctrl控制快进 (configurable)
 */
export function useSkip() {
  const keyBindings = useKeyBindings();
  // 因为document事件只绑定一次 为了防止之后更新GUIStore时取不到最新值
  // 使用Ref共享GUIStore
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  // 判断是否位于标题 & 存读档，选项 & 回想等页面
  const isGameActive = useGameActive(GUIStore);
  // 判断按键是否为快进键
  const skipKeys = [keyBindings.skip.primaryKey, keyBindings.skip.altKey].filter(Boolean);
  const isSkipKey = useCallback((e: KeyboardEvent) => skipKeys.includes(e.code), [skipKeys]);
  const handleCtrlKeydown = useCallback((e) => {
    if (isSkipKey(e) && isGameActive()) {
      // 按下快进键时，强制全文快进
      startFast(true);
    }
  }, [isSkipKey]);
  const handleCtrlKeyup = useCallback((e) => {
    if (isSkipKey(e) && isGameActive()) {
      stopFast();
    }
  }, [isSkipKey]);
  const handleWindowBlur = useCallback((e) => {
    // 停止快进
    stopFast();
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', handleCtrlKeydown);
    document.addEventListener('keyup', handleCtrlKeyup);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('keydown', handleCtrlKeydown);
      document.removeEventListener('keyup', handleCtrlKeyup);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [handleCtrlKeydown, handleCtrlKeyup]);
  // updated时验证状态
  useUpdated(() => {
    if (!isGameActive()) {
      stopFast();
    }
  });
}

/**
 * F5刷新 & 其他情况下导致页面卸载时快速保存
 */
export function useFastSaveBeforeUnloadPage() {
  const validMenuGameStart = useValidMenuGameStart();
  const handleWindowUnload = useCallback(async (e: BeforeUnloadEvent) => {
    if (validMenuGameStart()) {
      // 游戏启动了才保存数据 防止无效数据覆盖现在的数据
      await fastSaveGame();
    }
  }, []);
  useMounted(() => {
    window.addEventListener('beforeunload', handleWindowUnload);
  });
  useUnMounted(() => {
    window.removeEventListener('beforeunload', handleWindowUnload);
  });
}

// 判断游戏是否激活
function useGameActive<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return (
      !GUIStore.current.showTitle &&
      !GUIStore.current.showMenuPanel &&
      !GUIStore.current.showBacklog &&
      !GUIStore.current.showPanicOverlay
    );
  }, [GUIStore]);
}

// 判断是否打开backlog
function useIsInBackLog<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showBacklog;
  }, [GUIStore]);
}

// 判断是否打开了全局对话框
function useIsOpenedDialog<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showGlobalDialog;
  }, [GUIStore]);
}

// 判断是否打开了鉴赏模式
function useIsOpenedExtra<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showExtra;
  }, [GUIStore]);
}

function useIsPanicOverlayOpen<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showPanicOverlay;
  }, [GUIStore]);
}

// 验证是否在存档 / 读档 / 选项页面
function useValidMenuPanelTag<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return [MenuPanelTag.Save, MenuPanelTag.Load, MenuPanelTag.Option].includes(GUIStore.current.currentMenuTag);
  }, [GUIStore]);
}

function useValidMenuGameStart() {
  return useCallback(() => {
    // return !(runtime_currentSceneData.currentSentenceId === 0 &&
    //   runtime_currentSceneData.currentScene.sceneName === 'start.txt');
    return !(WebGAL.sceneManager.sceneData.currentSentenceId === 0);
  }, [WebGAL.sceneManager.sceneData]);
}

function useSetComponentVisibility(): (component: keyof componentsVisibility, visibility: boolean) => void {
  const dispatch = useDispatch();
  return (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
}

function nextTick(callback: () => void) {
  // 具体实现根据浏览器的兼容实现微任务
  if (typeof Promise !== 'undefined') {
    const p = Promise.resolve();
    p.then(callback);
  } else {
    // 兼容IE
    setTimeout(callback, 0);
  }
}

/**
 * 空格 & 回车 跳转到下一条 (configurable)
 */
export function useSpaceAndEnter() {
  const keyBindings = useKeyBindings();
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const isGameActive = useGameActive(GUIStore);
  const setComponentVisibility = useSetComponentVisibility();
  // 防止一直触发keydown导致快进
  const lockRef = useRef(false);
  // 判断按键是否为下一句键
  const nextSentenceKeys = [keyBindings.nextSentence.primaryKey, keyBindings.nextSentence.altKey].filter(Boolean);
  const isNextSentenceKey = useCallback((e: KeyboardEvent) => nextSentenceKeys.includes(e.code), [nextSentenceKeys]);
  const handleKeydown = useCallback((e) => {
    if (isNextSentenceKey(e) && isGameActive() && !lockRef.current) {
      if (!GUIStore.current.showTextBox) {
        setComponentVisibility('showTextBox', true);
        return;
      }
      stopAll();
      nextSentence();
      lockRef.current = true;
    }
  }, [isNextSentenceKey]);
  const handleKeyup = useCallback((e) => {
    if (isNextSentenceKey(e) && isGameActive()) {
      lockRef.current = false;
    }
  }, [isNextSentenceKey]);
  const handleWindowBlur = useCallback((e) => {
    lockRef.current = false;
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
    document.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('keyup', handleKeyup);
      document.removeEventListener('blur', handleWindowBlur);
    };
  }, [handleKeydown, handleKeyup]);
}

/**
 * 是否滚动到底部
 * @param dom
 */
function hasScrollToBottom(dom: Element) {
  const { scrollTop, clientHeight, scrollHeight } = dom;
  return scrollTop === 0;
}

/**
 * F11 进入全屏 (configurable)
 */
function useToggleFullScreen() {
  const { isSupported, isFullScreen, toggle } = useFullScreen();
  if (!isSupported) return;
  const dispatch = useDispatch();
  const keyBindings = useKeyBindings();
  const fullScreenKeys = [keyBindings.toggleFullScreen.primaryKey, keyBindings.toggleFullScreen.altKey].filter(Boolean);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (fullScreenKeys.includes(e.code)) {
        toggle();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  useEffect(() => {
    dispatch(setOptionData({ key: 'fullScreen', value: isFullScreen ? 0 : 1 }));
    if (WebGAL.gameKey) setStorage();
  }, [isFullScreen]);
}
