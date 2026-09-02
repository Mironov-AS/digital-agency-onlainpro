.class public Lcom/astrob/navi/astrobnavilib/JniToJava;
.super Ljava/lang/Object;


# direct methods
.method public constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public jniCallChangeDNModeByIllumi()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->changeDNModeByIllumi()V

    return-void
.end method

.method public jniCallGetCurLanguage()I
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getCurLanguage()I

    move-result v0

    return v0
.end method

.method public jniCallGetNaviInfo()Lcom/astrob/navi/astrobnavilib/NaviInfoBean;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getNaviInfo()Lcom/astrob/navi/astrobnavilib/NaviInfoBean;

    move-result-object v0

    return-object v0
.end method

.method public jniCallGetProductModel()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getProductModel()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallGetRundirPath()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/g;->b:Ljava/lang/String;

    return-object v0
.end method

.method public jniCallGetSdcardAvailableSize()J
    .locals 2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getSdcardPath()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/m;->b(Ljava/lang/String;)J

    move-result-wide v0

    return-wide v0
.end method

.method public jniCallGetSoftwareVersion()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getSoftwareVersion()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallGetStartNaviType()I
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getStartNaviType()I

    move-result v0

    return v0
.end method

.method public jniCallGetUUID()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getUUID()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallGetVolume()I
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public jniCallInitTTS(II)Z
    .locals 0

    const/4 p1, 0x1

    return p1
.end method

.method public jniCallIsExitOnBack()Z
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isExitOnBack()Z

    move-result v0

    return v0
.end method

.method public jniCallIsIllumiOn()Z
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isIllumiOn()Z

    move-result v0

    return v0
.end method

.method public jniCallIsLeftRuddle()Z
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isLeftRuddle()Z

    move-result v0

    return v0
.end method

.method public jniCallIsSurfaceViewEnabled()Z
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isSurfaceViewEnabled()Z

    move-result v0

    return v0
.end method

.method public jniCallIsTTSBusy()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public jniCallMoveTaskToBack()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->moveTaskToBack()V

    return-void
.end method

.method public jniCallMoveTaskToFront()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->moveTaskToFront()V

    return-void
.end method

.method public jniCallOnCameraInfo(DDDI)V
    .locals 9

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v1, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    move-wide v2, p1

    move-wide v4, p3

    move-wide v6, p5

    move/from16 v8, p7

    invoke-virtual/range {v1 .. v8}, Lcom/astrob/navi/astrobnavilib/j;->onCameraInfo(DDDI)V

    return-void
.end method

.method public jniCallOnChangeKeyboardCursor(I)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->updateKeyboardCursor(I)V

    return-void
.end method

.method public jniCallOnCheckAssetsDir(Ljava/lang/String;)Z
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->checkAssetsDir(Ljava/lang/String;)Z

    move-result p1

    return p1
.end method

.method public jniCallOnClearKeyboard()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->clearKeyboard()V

    return-void
.end method

.method public jniCallOnCurrentLocation(Ljava/lang/String;)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->onCurrentLocation(Ljava/lang/String;)V

    return-void
.end method

.method public jniCallOnDialogInit()V
    .locals 0

    return-void
.end method

.method public jniCallOnEngineInitFinished()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onEngineInitFinished()V

    return-void
.end method

.method public jniCallOnFinishRoute(I)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->finishRoute(I)V

    return-void
.end method

.method public jniCallOnFirstValidGPSReceived()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onFirstValidGPSReceived()V

    return-void
.end method

.method public jniCallOnGetKeyboardText()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getKeyboardText()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallOnGetSysTime()Lcom/astrob/navi/astrobnavilib/SysTime;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getSysTime()Lcom/astrob/navi/astrobnavilib/SysTime;

    move-result-object v0

    return-object v0
.end method

.method public jniCallOnGetUDiskMapdataDir()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getUDiskMapdataDir()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallOnGetUDiskPath()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getUDiskPath()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallOnGetUDiskRundirDir()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getUDiskRundirDir()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallOnGetUDiskSngFilePath()Ljava/lang/String;
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getUDiskSngFilePath()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public jniCallOnHideKeyboard()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->hideKeyboard()V

    return-void
.end method

.method public jniCallOnInitKeyboard(Ljava/lang/String;)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->initKeyboard(Ljava/lang/String;)V

    return-void
.end method

.method public jniCallOnIsShowKeyboard()Z
    .locals 5

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/d;->a()Lcom/astrob/navi/astrobnavilib/d;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    instance-of v1, v0, Landroid/app/Activity;

    const/4 v2, 0x0

    if-eqz v1, :cond_1

    check-cast v0, Landroid/app/Activity;

    invoke-virtual {v0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;

    move-result-object v1

    invoke-virtual {v1}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v1

    invoke-virtual {v1}, Landroid/view/View;->getHeight()I

    move-result v1

    new-instance v3, Landroid/graphics/Rect;

    invoke-direct {v3}, Landroid/graphics/Rect;-><init>()V

    invoke-virtual {v0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;

    move-result-object v4

    invoke-virtual {v4}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v4

    invoke-virtual {v4, v3}, Landroid/view/View;->getWindowVisibleDisplayFrame(Landroid/graphics/Rect;)V

    iget v3, v3, Landroid/graphics/Rect;->bottom:I

    sub-int/2addr v1, v3

    new-instance v3, Landroid/util/DisplayMetrics;

    invoke-direct {v3}, Landroid/util/DisplayMetrics;-><init>()V

    invoke-virtual {v0}, Landroid/app/Activity;->getWindowManager()Landroid/view/WindowManager;

    move-result-object v4

    invoke-interface {v4}, Landroid/view/WindowManager;->getDefaultDisplay()Landroid/view/Display;

    move-result-object v4

    invoke-virtual {v4, v3}, Landroid/view/Display;->getMetrics(Landroid/util/DisplayMetrics;)V

    iget v4, v3, Landroid/util/DisplayMetrics;->heightPixels:I

    invoke-virtual {v0}, Landroid/app/Activity;->getWindowManager()Landroid/view/WindowManager;

    move-result-object v0

    invoke-interface {v0}, Landroid/view/WindowManager;->getDefaultDisplay()Landroid/view/Display;

    move-result-object v0

    invoke-virtual {v0, v3}, Landroid/view/Display;->getRealMetrics(Landroid/util/DisplayMetrics;)V

    iget v0, v3, Landroid/util/DisplayMetrics;->heightPixels:I

    if-le v0, v4, :cond_0

    sub-int/2addr v0, v4

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    sub-int/2addr v1, v0

    if-eqz v1, :cond_1

    const/4 v0, 0x1

    return v0

    :cond_1
    return v2
.end method

.method public jniCallOnMapManager()V
    .locals 0

    return-void
.end method

.method public jniCallOnNaviDispatch(Ljava/lang/String;)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->onNaviDispatch(Ljava/lang/String;)V

    return-void
.end method

.method public jniCallOnNaviExitFinished()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onNaviExitFinished()V

    return-void
.end method

.method public jniCallOnNaviExitStarted()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onNaviExitStarted()V

    return-void
.end method

.method public jniCallOnNaviInitFinished()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onNaviInitFinished()V

    return-void
.end method

.method public jniCallOnNaviInitStarted()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onNaviInitStarted()V

    return-void
.end method

.method public jniCallOnProtocolResponse(Ljava/lang/String;)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->onProtocolResponse(Ljava/lang/String;)V

    return-void
.end method

.method public jniCallOnReportStatus(II)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1, p2}, Lcom/astrob/navi/astrobnavilib/j;->reportStatus(II)V

    return-void
.end method

.method public jniCallOnResetToDefault()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->resetToDefault()V

    return-void
.end method

.method public jniCallOnResult(II)V
    .locals 2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v1

    iget-object v1, v1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v1}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    invoke-virtual {v0, v1, p1, p2}, Lcom/astrob/navi/astrobnavilib/j;->onResult(Landroid/content/Context;II)V

    return-void
.end method

.method public jniCallOnRoadSpeed(I)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->updateRoadSpeed(I)V

    return-void
.end method

.method public jniCallOnSearchResult(ZLjava/util/List;)V
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(Z",
            "Ljava/util/List<",
            "Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;",
            ">;)V"
        }
    .end annotation

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->getVrListener()Lcom/astrob/navi/astrobnavilib/l;

    move-result-object p1

    if-eqz p1, :cond_0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->getVrListener()Lcom/astrob/navi/astrobnavilib/l;

    :cond_0
    return-void
.end method

.method public jniCallOnSelectPoi(I)V
    .locals 0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->getVrListener()Lcom/astrob/navi/astrobnavilib/l;

    move-result-object p1

    if-eqz p1, :cond_0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->getVrListener()Lcom/astrob/navi/astrobnavilib/l;

    :cond_0
    return-void
.end method

.method public jniCallOnShowKeyboard()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->showKeyboard()V

    return-void
.end method

.method public jniCallOnStartPlayVoice()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->startPlayVoice()V

    return-void
.end method

.method public jniCallOnStopPlayVoice()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->stopPlayVoice()V

    return-void
.end method

.method public jniCallOnTouchTone()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onTouchTone()V

    return-void
.end method

.method public jniCallPlayTTS(Ljava/lang/String;)V
    .locals 0

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/o;->a(Ljava/lang/String;)V

    return-void
.end method

.method public jniCallSetTTSLanguage(I)V
    .locals 0

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/o;->c(I)V

    return-void
.end method

.method public jniCallSetTimeZone(I)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->setTimeZone(I)V

    return-void
.end method

.method public jniCallSetVolume(II)V
    .locals 0

    return-void
.end method

.method public jniCallStartGPS(I)V
    .locals 0

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/c;->a(I)V

    return-void
.end method

.method public jniCallStartNavi(Z)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1}, Lcom/astrob/navi/astrobnavilib/j;->startNavi(Z)V

    return-void
.end method

.method public jniCallStopNavi()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->stopNavi()V

    return-void
.end method

.method public jniCallStopTTS()V
    .locals 0

    return-void
.end method

.method public jniCallUptNavInfo()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->uptNavInfo()V

    return-void
.end method

.method public jniCallWaveOutClose(I)I
    .locals 0

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/o;->b(I)I

    move-result p1

    return p1
.end method

.method public jniCallWaveOutOpen(III)Z
    .locals 0

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/o;->a(I)Z

    move-result p1

    return p1
.end method

.method public jniCallWaveOutStop()V
    .locals 0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/o;->b()V

    return-void
.end method

.method public jniCallWaveOutWrite([BI)I
    .locals 0

    invoke-static {p1, p2}, Lcom/astrob/navi/astrobnavilib/o;->a([BI)I

    move-result p1

    return p1
.end method

.method public jniCallWavePlayAlert()Z
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/o;->c()Z

    move-result v0

    return v0
.end method

.method public jniCallWaveSetVolume(II)V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p1, p2}, Lcom/astrob/navi/astrobnavilib/j;->setAudioVolume(II)V

    return-void
.end method

.method public jniIs24HourFormat()Z
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->is24HourFormat()Z

    move-result v0

    return v0
.end method
