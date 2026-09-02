.class public Lcom/astrob/navi/astrobnavilib/j;
.super Ljava/lang/Object;


# instance fields
.field private final TAG:Ljava/lang/String;

.field protected appContext:Landroid/content/Context;

.field private contextWeakReference:Ljava/lang/ref/WeakReference;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/lang/ref/WeakReference<",
            "Landroid/content/Context;",
            ">;"
        }
    .end annotation
.end field

.field private volatile isActivityStartup:Z

.field protected volatile isDestNavi:Z

.field private volatile isEngineRunning:Z

.field private volatile isRunInBackground:Z

.field private volatile isSurfaceViewEnabled:Z

.field protected mapHeight:I

.field protected mapWidth:I

.field protected naviInfoBean:Lcom/astrob/navi/astrobnavilib/NaviInfoBean;

.field private volatile startNaviType:I

.field protected uiHeight:I

.field protected uiWidth:I

.field protected vrListener:Lcom/astrob/navi/astrobnavilib/l;


# direct methods
.method public constructor <init>()V
    .locals 2

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    invoke-virtual {p0}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->TAG:Ljava/lang/String;

    new-instance v0, Lcom/astrob/navi/astrobnavilib/NaviInfoBean;

    invoke-direct {v0}, Lcom/astrob/navi/astrobnavilib/NaviInfoBean;-><init>()V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->naviInfoBean:Lcom/astrob/navi/astrobnavilib/NaviInfoBean;

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isEngineRunning:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isDestNavi:Z

    const/4 v1, -0x1

    iput v1, p0, Lcom/astrob/navi/astrobnavilib/j;->startNaviType:I

    const/4 v1, 0x0

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/j;->vrListener:Lcom/astrob/navi/astrobnavilib/l;

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/j;->uiWidth:I

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/j;->uiHeight:I

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/j;->mapWidth:I

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/j;->mapHeight:I

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isRunInBackground:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isActivityStartup:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isSurfaceViewEnabled:Z

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/j;->appContext:Landroid/content/Context;

    return-void
.end method


# virtual methods
.method public changeDNModeByIllumi()V
    .locals 0

    return-void
.end method

.method checkAssetsDir(Ljava/lang/String;)Z
    .locals 3

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-virtual {v0}, Landroid/content/Context;->getAssets()Landroid/content/res/AssetManager;

    move-result-object v0

    const/4 v1, 0x0

    :try_start_0
    sget-object v2, Ljava/io/File;->separator:Ljava/lang/String;

    invoke-virtual {p1, v2}, Ljava/lang/String;->lastIndexOf(Ljava/lang/String;)I

    move-result v2

    if-lez v2, :cond_0

    invoke-virtual {p1, v1, v2}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object p1

    :cond_0
    invoke-virtual {v0, p1}, Landroid/content/res/AssetManager;->list(Ljava/lang/String;)[Ljava/lang/String;

    move-result-object v0

    if-eqz v0, :cond_1

    array-length v0, v0
    :try_end_0
    .catch Ljava/io/IOException; {:try_start_0 .. :try_end_0} :catch_0

    if-lez v0, :cond_1

    const/4 v0, 0x1

    const/4 v1, 0x1

    goto :goto_0

    :catch_0
    move-exception v0

    invoke-virtual {v0}, Ljava/io/IOException;->printStackTrace()V

    :cond_1
    :goto_0
    if-eqz v1, :cond_2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->TAG:Ljava/lang/String;

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, " is exist"

    invoke-virtual {v2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {v0, p1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    goto :goto_1

    :cond_2
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->TAG:Ljava/lang/String;

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, " is not exist"

    invoke-virtual {v2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {v0, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :goto_1
    return v1
.end method

.method public checkPermission(Landroid/content/Context;I)Z
    .locals 0

    const/4 p1, 0x1

    return p1
.end method

.method public clearKeyboard()V
    .locals 3

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    new-instance v1, Landroid/content/Intent;

    const-string v2, "CLEAR_SYS_KEYBOARD"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/content/Context;->sendBroadcast(Landroid/content/Intent;)V

    return-void
.end method

.method public doInit()V
    .locals 0

    return-void
.end method

.method public doUnInit()V
    .locals 0

    return-void
.end method

.method public exitApp()V
    .locals 0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->exitApp()Z

    return-void
.end method

.method public finalize()V
    .locals 1

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isDestNavi:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isEngineRunning:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isRunInBackground:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isActivityStartup:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isSurfaceViewEnabled:Z

    return-void
.end method

.method public finishRoute(I)V
    .locals 0

    return-void
.end method

.method public get4S()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getAppPackageName()Ljava/lang/String;
    .locals 1

    const-string v0, "com.astrob.turbodog"

    return-object v0
.end method

.method public getAudioAttributes()Landroid/media/AudioAttributes;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getContentProviderUri()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getContext()Landroid/content/Context;
    .locals 1

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->contextWeakReference:Ljava/lang/ref/WeakReference;

    if-nez v0, :cond_0

    const/4 v0, 0x0

    return-object v0

    :cond_0
    invoke-virtual {v0}, Ljava/lang/ref/WeakReference;->get()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/content/Context;

    return-object v0
.end method

.method public getCurLanguage()I
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public getErrInfo()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getKeyboardText()Ljava/lang/String;
    .locals 2

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    if-eqz v0, :cond_0

    instance-of v1, v0, Lcom/astrob/navi/astrobnavilib/e;

    if-eqz v1, :cond_0

    check-cast v0, Lcom/astrob/navi/astrobnavilib/e;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/e;->d()Ljava/lang/String;

    move-result-object v0

    return-object v0

    :cond_0
    const-string v0, ""

    return-object v0
.end method

.method public getMapDensityDpi()I
    .locals 1

    const/16 v0, 0xa0

    return v0
.end method

.method public final getMapHeight()I
    .locals 1

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/j;->mapHeight:I

    return v0
.end method

.method public final getMapWidth()I
    .locals 1

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/j;->mapWidth:I

    return v0
.end method

.method public getNaviInfo()Lcom/astrob/navi/astrobnavilib/NaviInfoBean;
    .locals 1

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->naviInfoBean:Lcom/astrob/navi/astrobnavilib/NaviInfoBean;

    return-object v0
.end method

.method public getNaviRootDir()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getNaviTtsStreamType()I
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public getProductModel()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getSdcardPath()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getSoftwareVersion()Ljava/lang/String;
    .locals 4

    const-string v0, ""

    :try_start_0
    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    invoke-virtual {v1}, Landroid/content/Context;->getPackageManager()Landroid/content/pm/PackageManager;

    move-result-object v1

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v2

    invoke-virtual {v2}, Landroid/content/Context;->getPackageName()Ljava/lang/String;

    move-result-object v2

    const/4 v3, 0x0

    invoke-virtual {v1, v2, v3}, Landroid/content/pm/PackageManager;->getPackageInfo(Ljava/lang/String;I)Landroid/content/pm/PackageInfo;

    move-result-object v1

    iget-object v2, v1, Landroid/content/pm/PackageInfo;->versionName:Ljava/lang/String;

    if-eqz v2, :cond_0

    iget-object v0, v1, Landroid/content/pm/PackageInfo;->versionName:Ljava/lang/String;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v1

    const-string v2, "VersionInfo"

    const-string v3, "Exception"

    invoke-static {v2, v3, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)I

    :cond_0
    :goto_0
    return-object v0
.end method

.method public getStartNaviType()I
    .locals 1

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/j;->startNaviType:I

    return v0
.end method

.method public final getSysTime()Lcom/astrob/navi/astrobnavilib/SysTime;
    .locals 4

    invoke-static {}, Ljava/util/Calendar;->getInstance()Ljava/util/Calendar;

    move-result-object v0

    new-instance v1, Lcom/astrob/navi/astrobnavilib/SysTime;

    invoke-direct {v1}, Lcom/astrob/navi/astrobnavilib/SysTime;-><init>()V

    const/4 v2, 0x1

    invoke-virtual {v0, v2}, Ljava/util/Calendar;->get(I)I

    move-result v3

    iput v3, v1, Lcom/astrob/navi/astrobnavilib/SysTime;->year:I

    const/4 v3, 0x2

    invoke-virtual {v0, v3}, Ljava/util/Calendar;->get(I)I

    move-result v3

    add-int/2addr v3, v2

    iput v3, v1, Lcom/astrob/navi/astrobnavilib/SysTime;->month:I

    const/4 v2, 0x5

    invoke-virtual {v0, v2}, Ljava/util/Calendar;->get(I)I

    move-result v2

    iput v2, v1, Lcom/astrob/navi/astrobnavilib/SysTime;->day:I

    const/16 v2, 0xb

    invoke-virtual {v0, v2}, Ljava/util/Calendar;->get(I)I

    move-result v2

    iput v2, v1, Lcom/astrob/navi/astrobnavilib/SysTime;->hour:I

    const/16 v2, 0xc

    invoke-virtual {v0, v2}, Ljava/util/Calendar;->get(I)I

    move-result v2

    iput v2, v1, Lcom/astrob/navi/astrobnavilib/SysTime;->minute:I

    const/16 v2, 0xd

    invoke-virtual {v0, v2}, Ljava/util/Calendar;->get(I)I

    move-result v0

    iput v0, v1, Lcom/astrob/navi/astrobnavilib/SysTime;->second:I

    return-object v1
.end method

.method public getSysType()I
    .locals 1

    const/4 v0, -0x1

    return v0
.end method

.method public getUDiskMapdataDir()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getUDiskNaviRootDir()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getUDiskPath()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getUDiskPathList()[Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getUDiskRundirDir()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getUDiskSngFilePath()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public final getUIHeight()I
    .locals 1

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/j;->uiHeight:I

    return v0
.end method

.method public final getUIWidth()I
    .locals 1

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/j;->uiWidth:I

    return v0
.end method

.method public getUUID()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getUserDataPath()Ljava/lang/String;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public getVolumeStreamType()I
    .locals 1

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getNaviTtsStreamType()I

    move-result v0

    return v0
.end method

.method public getVrListener()Lcom/astrob/navi/astrobnavilib/l;
    .locals 1

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->vrListener:Lcom/astrob/navi/astrobnavilib/l;

    return-object v0
.end method

.method public handleAudioTrackFocusChanged(I)V
    .locals 0

    return-void
.end method

.method public handleProtocal(Landroid/content/Context;Landroid/content/Intent;)V
    .locals 0

    return-void
.end method

.method public hideKeyboard()V
    .locals 3

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    new-instance v1, Landroid/content/Intent;

    const-string v2, "HIDE_SYS_KEYBOARD"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/content/Context;->sendBroadcast(Landroid/content/Intent;)V

    return-void
.end method

.method public initKeyboard(Ljava/lang/String;)V
    .locals 2

    new-instance v0, Landroid/content/Intent;

    const-string v1, "INIT_SYS_KEYBOARD"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "text"

    invoke-virtual {v0, v1, p1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object p1

    invoke-virtual {p1, v0}, Landroid/content/Context;->sendBroadcast(Landroid/content/Intent;)V

    return-void
.end method

.method public final is24HourFormat()Z
    .locals 1

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0}, Landroid/text/format/DateFormat;->is24HourFormat(Landroid/content/Context;)Z

    move-result v0

    return v0
.end method

.method public final isAppActivityStartup()Z
    .locals 1

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isActivityStartup:Z

    return v0
.end method

.method public final isAppRunInBack()Z
    .locals 1

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isRunInBackground:Z

    return v0
.end method

.method public final isDestNavi()Z
    .locals 1

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isDestNavi:Z

    return v0
.end method

.method public final isEngineRunning()Z
    .locals 1

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isEngineRunning:Z

    return v0
.end method

.method public isExitOnBack()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public isFree()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public isIllumiOn()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public isLeftRuddle()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method

.method public isOpenService()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public isRenderOnPause()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public final isSurfaceViewEnabled()Z
    .locals 1

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isSurfaceViewEnabled:Z

    return v0
.end method

.method public isUseContentProvider()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public final moveTaskToBack()V
    .locals 3

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    if-nez v0, :cond_0

    return-void

    :cond_0
    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    new-instance v1, Landroid/content/Intent;

    const-string v2, "MOVE_TASK_TO_BACK"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/content/Context;->sendBroadcast(Landroid/content/Intent;)V

    return-void
.end method

.method public final moveTaskToFront()V
    .locals 3

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    new-instance v1, Landroid/content/Intent;

    const-string v2, "MOVE_TASK_TO_FRONT"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/content/Context;->sendBroadcast(Landroid/content/Intent;)V

    return-void
.end method

.method public needHideMapData()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public onAppCreate(Landroid/content/Context;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/j;->appContext:Landroid/content/Context;

    return-void
.end method

.method public onAppDestroy()V
    .locals 1

    const/4 v0, 0x0

    invoke-static {v0}, Ljava/lang/System;->exit(I)V

    return-void
.end method

.method public onAppRunStatus(Z)V
    .locals 0

    xor-int/lit8 p1, p1, 0x1

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/j;->isRunInBackground:Z

    return-void
.end method

.method public onCameraInfo(DDDI)V
    .locals 0

    return-void
.end method

.method public onCurrentLocation(Ljava/lang/String;)V
    .locals 0

    return-void
.end method

.method public onEngineInitFinished()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/i;->a()Lcom/astrob/navi/astrobnavilib/i;

    move-result-object v0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/i;->b()V

    return-void
.end method

.method public onFirstValidGPSReceived()V
    .locals 0

    return-void
.end method

.method public onNaviDispatch(Ljava/lang/String;)V
    .locals 0

    return-void
.end method

.method public onNaviExitFinished()V
    .locals 1

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isEngineRunning:Z

    return-void
.end method

.method public onNaviExitStarted()V
    .locals 0

    return-void
.end method

.method public onNaviInitFinished()V
    .locals 1

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isEngineRunning:Z

    return-void
.end method

.method public onNaviInitStarted()V
    .locals 0

    return-void
.end method

.method public onProtocolResponse(Ljava/lang/String;)V
    .locals 0

    return-void
.end method

.method public onResult(Landroid/content/Context;II)V
    .locals 0

    return-void
.end method

.method public onResume()V
    .locals 0

    return-void
.end method

.method public onSearchResult(I)V
    .locals 0

    return-void
.end method

.method public onTouchTone()V
    .locals 0

    return-void
.end method

.method public openTtsLog()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public regeisteProtocal()Landroid/content/IntentFilter;
    .locals 1

    const/4 v0, 0x0

    return-object v0
.end method

.method public reportStatus(II)V
    .locals 0

    return-void
.end method

.method public requestAudio4Play()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method

.method public resetLaunchErrorTipViewPos(Landroid/content/Context;)Landroid/os/Bundle;
    .locals 0

    const/4 p1, 0x0

    return-object p1
.end method

.method public resetToDefault()V
    .locals 0

    return-void
.end method

.method public final setAppActivityStartup(Z)V
    .locals 0

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/j;->isActivityStartup:Z

    return-void
.end method

.method public setAudioVolume(II)V
    .locals 0

    invoke-static {p1, p2}, Lcom/astrob/navi/astrobnavilib/o;->a(II)V

    return-void
.end method

.method public setContext(Landroid/content/Context;)V
    .locals 1

    if-nez p1, :cond_0

    const/4 p1, 0x0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/j;->contextWeakReference:Ljava/lang/ref/WeakReference;

    return-void

    :cond_0
    new-instance v0, Ljava/lang/ref/WeakReference;

    invoke-direct {v0, p1}, Ljava/lang/ref/WeakReference;-><init>(Ljava/lang/Object;)V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->contextWeakReference:Ljava/lang/ref/WeakReference;

    return-void
.end method

.method public setNetworkStatus(Landroid/content/Context;)V
    .locals 0

    return-void
.end method

.method public setStartNaviType(I)V
    .locals 0

    iput p1, p0, Lcom/astrob/navi/astrobnavilib/j;->startNaviType:I

    return-void
.end method

.method public final setSurfaceViewEnabled(Z)V
    .locals 0

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/j;->isSurfaceViewEnabled:Z

    return-void
.end method

.method public final setTimeZone(I)V
    .locals 5

    if-ltz p1, :cond_0

    move v0, p1

    goto :goto_0

    :cond_0
    neg-int v0, p1

    :goto_0
    invoke-static {}, Ljava/util/Locale;->getDefault()Ljava/util/Locale;

    move-result-object v1

    const-string v2, "GMT%c%02d:%02d"

    const/4 v3, 0x3

    new-array v3, v3, [Ljava/lang/Object;

    const/4 v4, 0x0

    if-ltz p1, :cond_1

    const/16 p1, 0x2b

    goto :goto_1

    :cond_1
    const/16 p1, 0x2d

    :goto_1
    invoke-static {p1}, Ljava/lang/Character;->valueOf(C)Ljava/lang/Character;

    move-result-object p1

    aput-object p1, v3, v4

    const/4 p1, 0x1

    div-int/lit8 v4, v0, 0x3c

    invoke-static {v4}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v4

    aput-object v4, v3, p1

    const/4 p1, 0x2

    rem-int/lit8 v0, v0, 0x3c

    invoke-static {v0}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v0

    aput-object v0, v3, p1

    invoke-static {v1, v2, v3}, Ljava/lang/String;->format(Ljava/util/Locale;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    const-string v1, "alarm"

    invoke-virtual {v0, v1}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/app/AlarmManager;

    invoke-virtual {v0, p1}, Landroid/app/AlarmManager;->setTimeZone(Ljava/lang/String;)V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/j;->TAG:Ljava/lang/String;

    const-string v1, "setTimeZone "

    invoke-static {p1}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {v1, p1}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    invoke-static {v0, p1}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method public final setUIHeight(I)V
    .locals 0

    iput p1, p0, Lcom/astrob/navi/astrobnavilib/j;->uiHeight:I

    return-void
.end method

.method public final setUIWidth(I)V
    .locals 0

    iput p1, p0, Lcom/astrob/navi/astrobnavilib/j;->uiWidth:I

    return-void
.end method

.method public showKeyboard()V
    .locals 3

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v0

    new-instance v1, Landroid/content/Intent;

    const-string v2, "SHOW_SYS_KEYBOARD"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/content/Context;->sendBroadcast(Landroid/content/Intent;)V

    return-void
.end method

.method public startNavi(Z)V
    .locals 0

    const/4 p1, 0x1

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/j;->isDestNavi:Z

    return-void
.end method

.method public startPlayVoice()V
    .locals 0

    return-void
.end method

.method public stopNavi()V
    .locals 1

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/j;->isDestNavi:Z

    return-void
.end method

.method public stopPlayVoice()V
    .locals 0

    return-void
.end method

.method public supportUDiskUpdateMapData()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public updateKeyboardCursor(I)V
    .locals 2

    new-instance v0, Landroid/content/Intent;

    const-string v1, "UPDATE_SYS_KEYBOARD_CURSOR"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "cursor"

    invoke-virtual {v0, v1, p1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;I)Landroid/content/Intent;

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object p1

    invoke-virtual {p1, v0}, Landroid/content/Context;->sendBroadcast(Landroid/content/Intent;)V

    return-void
.end method

.method public updateRoadSpeed(I)V
    .locals 0

    return-void
.end method

.method public uptNavInfo()V
    .locals 0

    return-void
.end method

.method public useAudioTrackBuilder()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method
