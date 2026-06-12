import styles from './tabletTopBar.module.scss';
import { switchAuto } from '@/Core/controller/gamePlay/autoPlay';
import { switchFast } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { loadGame } from '@/Core/controller/storage/loadGame';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { useValue } from '@/hooks/useValue';

export const TabletTopBar = () => {
  const t = useTrans('gaming.');
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const collapsed = useValue(false);

  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };

  if (!GUIStore.enableTabletMode || !GUIStore.isEnterGame || GUIStore.showTitle) {
    return null;
  }

  return (
    <div
      className={styles.topBar}
      style={{
        transform: GUIStore.controlsVisibility ? 'translateY(0)' : 'translateY(-110%)',
      }}
    >
      <div className={`${styles.topBarInnerWrap} ${collapsed.value ? styles.topBarInnerWrapCollapsed : ''}`}>
      <div className={styles.topBarInner}>
        {/* 快速存档 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            showGlogalDialog({
              title: t('buttons.qsTips'),
              leftText: t('$common.yes'),
              rightText: t('$common.no'),
              leftFunc: () => {
                saveGame(0);
              },
              rightFunc: () => {},
            });
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-chevron-double-down" />
          <span className={styles.topBarButtonText}>{t('buttons.quicklySave')}</span>
        </div>

        {/* 快速读档 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            showGlogalDialog({
              title: t('buttons.qlTips'),
              leftText: t('$common.yes'),
              rightText: t('$common.no'),
              leftFunc: () => {
                loadGame(0);
              },
              rightFunc: () => {},
            });
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-chevron-double-up" />
          <span className={styles.topBarButtonText}>{t('buttons.quicklyLoad')}</span>
        </div>

        {/* 存档 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            setMenuPanel(MenuPanelTag.Save);
            setComponentVisibility('showMenuPanel', true);
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-floppy2" />
          <span className={styles.topBarButtonText}>{t('buttons.save')}</span>
        </div>

        {/* 读档 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            setMenuPanel(MenuPanelTag.Load);
            setComponentVisibility('showMenuPanel', true);
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-folder2-open" />
          <span className={styles.topBarButtonText}>{t('buttons.load')}</span>
        </div>

        <div className={styles.topBarDivider} />

        {/* 剧情回想 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            setComponentVisibility('showBacklog', true);
            setComponentVisibility('showTextBox', false);
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-file-text" />
          <span className={styles.topBarButtonText}>{t('buttons.backlog')}</span>
        </div>

        {/* 重播语音 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            const VocalControl: any = document.getElementById('currentVocal');
            if (VocalControl !== null) {
              VocalControl.currentTime = 0;
              VocalControl.pause();
              VocalControl?.play();
            }
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-arrow-clockwise" />
          <span className={styles.topBarButtonText}>{t('buttons.replay')}</span>
        </div>

        {/* 自动模式 */}
        <div
          id="TabletTopBar_auto"
          className={styles.topBarButton}
          onClick={() => {
            switchAuto();
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-play" />
          <span className={styles.topBarButtonText}>{t('buttons.auto')}</span>
        </div>

        {/* 快进 */}
        <div
          id="TabletTopBar_fast"
          className={styles.topBarButton}
          onClick={() => {
            switchFast();
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-fast-forward" />
          <span className={styles.topBarButtonText}>{t('buttons.forward')}</span>
        </div>

        <div className={styles.topBarDivider} />

        {/* 设置 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            setMenuPanel(MenuPanelTag.Option);
            setComponentVisibility('showMenuPanel', true);
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-sliders2" />
          <span className={styles.topBarButtonText}>{t('buttons.options')}</span>
        </div>

        {/* 返回标题 */}
        <div
          className={styles.topBarButton}
          onClick={() => {
            playSeDialogOpen();
            showGlogalDialog({
              title: t('buttons.titleTips'),
              leftText: t('$common.yes'),
              rightText: t('$common.no'),
              leftFunc: () => {
                backToTitle();
              },
              rightFunc: () => {},
            });
          }}
          onMouseEnter={playSeEnter}
        >
          <i className="bi bi-house" />
          <span className={styles.topBarButtonText}>{t('buttons.title')}</span>
        </div>
      </div>
      {/* 折叠/展开按钮 */}
      <div
        className={`${styles.collapseToggle} ${collapsed.value ? styles.collapseToggleCollapsed : ''}`}
        onClick={() => {
          collapsed.set(!collapsed.value);
          playSeClick();
        }}
        onMouseEnter={playSeEnter}
      >
        <i className="bi bi-chevron-up" />
      </div>
      </div>
    </div>
  );
};
