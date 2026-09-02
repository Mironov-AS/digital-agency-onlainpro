.class Lcom/astrob/turbodog/SkywellCustomCenter;
.super Lcom/astrob/turbodog/GenericCustomCenter;


# static fields
.field public static final RECV_SYSTEM_MESSAGE:Ljava/lang/String; = "AUTONAVI_STANDARD_BROADCAST_RECV"


# instance fields
.field private final TAG:Ljava/lang/String;

.field private uuid:Ljava/lang/String;


# direct methods
.method constructor <init>()V
    .locals 1

    invoke-direct {p0}, Lcom/astrob/turbodog/GenericCustomCenter;-><init>()V

    const-string v0, "SkywellCustomCenter"

    iput-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->TAG:Ljava/lang/String;

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->uuid:Ljava/lang/String;

    const/16 v0, 0x500

    iput v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->uiWidth:I

    const/16 v0, 0x2d0

    iput v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->uiHeight:I

    return-void
.end method


# virtual methods
.method public doInit()V
    .locals 2

    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/b;

    invoke-interface {v1}, Lcom/astrob/turbodog/b;->b()V

    goto :goto_0

    :cond_0
    return-void
.end method

.method public doUnInit()V
    .locals 2

    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/b;

    invoke-interface {v1}, Lcom/astrob/turbodog/b;->c()V

    goto :goto_0

    :cond_0
    return-void
.end method

.method public getNaviTtsStreamType()I
    .locals 1

    const/16 v0, 0xc

    return v0
.end method

.method public getSdcardPath()Ljava/lang/String;
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->sdcardPath:Ljava/lang/String;

    if-nez v0, :cond_0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    invoke-static {}, Landroid/os/Environment;->getExternalStorageDirectory()Ljava/io/File;

    move-result-object v1

    invoke-virtual {v1}, Ljava/io/File;->getPath()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v1, Ljava/io/File;->separator:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->sdcardPath:Ljava/lang/String;

    :cond_0
    iget-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->sdcardPath:Ljava/lang/String;

    return-object v0
.end method

.method public getUDiskMapdataDir()Ljava/lang/String;
    .locals 1

    const-string v0, "TurboDog/mapdata"

    return-object v0
.end method

.method public getUDiskPath()Ljava/lang/String;
    .locals 11

    const-string v0, "/mnt/media_rw"

    const-string v1, ""

    const/4 v2, 0x0

    :try_start_0
    new-instance v3, Ljava/io/File;

    invoke-direct {v3, v0}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    const/4 v0, 0x1

    nop

    if-eqz v0, :cond_3

    invoke-virtual {v3}, Ljava/io/File;->listFiles()[Ljava/io/File;

    move-result-object v0
    :try_end_0
    .catch Ljava/lang/NullPointerException; {:try_start_0 .. :try_end_0} :catch_3
    .catch Ljava/lang/SecurityException; {:try_start_0 .. :try_end_0} :catch_2

    if-eqz v0, :cond_3

    move-object v3, v1

    const/4 v1, 0x0

    const/4 v4, 0x0

    :goto_0
    :try_start_1
    array-length v5, v0

    if-ge v1, v5, :cond_4

    aget-object v5, v0, v1

    invoke-virtual {v5}, Ljava/io/File;->isDirectory()Z

    move-result v6

    if-eqz v6, :cond_2

    invoke-virtual {v5}, Ljava/io/File;->listFiles()[Ljava/io/File;

    move-result-object v6

    if-eqz v6, :cond_1

    const/4 v7, 0x0

    :goto_1
    array-length v8, v6

    if-ge v7, v8, :cond_1

    aget-object v8, v6, v7

    invoke-virtual {v8}, Ljava/io/File;->getName()Ljava/lang/String;

    move-result-object v9

    const-string v10, "SkywellCustomCenter"

    invoke-static {v10, v9}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {v8}, Ljava/io/File;->isDirectory()Z

    move-result v8

    if-eqz v8, :cond_0

    const-string v8, "TurboDog"

    invoke-virtual {v9, v8}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v8

    if-eqz v8, :cond_0

    invoke-virtual {v5}, Ljava/io/File;->getAbsolutePath()Ljava/lang/String;

    move-result-object v3
    :try_end_1
    .catch Ljava/lang/NullPointerException; {:try_start_1 .. :try_end_1} :catch_1
    .catch Ljava/lang/SecurityException; {:try_start_1 .. :try_end_1} :catch_0

    const/4 v4, 0x1

    goto :goto_2

    :cond_0
    add-int/lit8 v7, v7, 0x1

    goto :goto_1

    :cond_1
    :goto_2
    if-nez v4, :cond_4

    :cond_2
    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :catch_0
    move-exception v0

    goto :goto_3

    :catch_1
    move-exception v0

    goto :goto_4

    :cond_3
    move-object v3, v1

    const/4 v4, 0x0

    goto :goto_5

    :catch_2
    move-exception v0

    move-object v3, v1

    const/4 v4, 0x0

    :goto_3
    invoke-virtual {v0}, Ljava/lang/SecurityException;->printStackTrace()V

    goto :goto_5

    :catch_3
    move-exception v0

    move-object v3, v1

    const/4 v4, 0x0

    :goto_4
    invoke-virtual {v0}, Ljava/lang/NullPointerException;->printStackTrace()V

    :cond_4
    :goto_5
    const-string v0, "SkywellCustomCenter"

    if-eqz v4, :cond_5

    const-string v1, "find udisk\'path ok."

    goto :goto_6

    :cond_5
    const-string v1, "can\'t find udisk\'path."

    :goto_6
    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    const-string v0, "SkywellCustomCenter"

    const-string v1, "udisk\'path : "

    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-object v3
.end method

.method public getUDiskRundirDir()Ljava/lang/String;
    .locals 1

    const-string v0, "TurboDog/rundir"

    return-object v0
.end method

.method public getUDiskSngFilePath()Ljava/lang/String;
    .locals 10

    const-string v0, "/mnt/media_rw"

    const-string v1, ""

    :try_start_0
    new-instance v2, Ljava/io/File;

    invoke-direct {v2, v0}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    const/4 v0, 0x1

    nop

    if-eqz v0, :cond_5

    invoke-virtual {v2}, Ljava/io/File;->listFiles()[Ljava/io/File;

    move-result-object v0
    :try_end_0
    .catch Ljava/lang/NullPointerException; {:try_start_0 .. :try_end_0} :catch_3
    .catch Ljava/lang/SecurityException; {:try_start_0 .. :try_end_0} :catch_2

    if-eqz v0, :cond_4

    const/4 v2, 0x0

    move-object v3, v1

    const/4 v1, 0x0

    const/4 v4, 0x0

    :goto_0
    :try_start_1
    array-length v5, v0

    if-ge v1, v5, :cond_3

    aget-object v5, v0, v1

    invoke-virtual {v5}, Ljava/io/File;->isDirectory()Z

    move-result v6

    if-eqz v6, :cond_2

    invoke-virtual {v5}, Ljava/io/File;->listFiles()[Ljava/io/File;

    move-result-object v5

    if-eqz v5, :cond_1

    const/4 v6, 0x0

    :goto_1
    array-length v7, v5

    if-ge v6, v7, :cond_1

    aget-object v7, v5, v6

    invoke-virtual {v7}, Ljava/io/File;->getName()Ljava/lang/String;

    move-result-object v8

    const-string v9, "SkywellCustomCenter"

    invoke-static {v9, v8}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {v7}, Ljava/io/File;->isFile()Z

    move-result v9

    if-eqz v9, :cond_0

    const-string v9, "licensekey.sng"

    invoke-virtual {v8, v9}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v8

    if-eqz v8, :cond_0

    invoke-virtual {v7}, Ljava/io/File;->getAbsolutePath()Ljava/lang/String;

    move-result-object v3
    :try_end_1
    .catch Ljava/lang/NullPointerException; {:try_start_1 .. :try_end_1} :catch_1
    .catch Ljava/lang/SecurityException; {:try_start_1 .. :try_end_1} :catch_0

    const/4 v4, 0x1

    goto :goto_2

    :cond_0
    add-int/lit8 v6, v6, 0x1

    goto :goto_1

    :cond_1
    :goto_2
    if-nez v4, :cond_3

    :cond_2
    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_3
    move-object v1, v3

    goto :goto_6

    :catch_0
    move-exception v0

    move-object v1, v3

    goto :goto_4

    :catch_1
    move-exception v0

    move-object v1, v3

    goto :goto_5

    :cond_4
    :try_start_2
    const-string v0, "SkywellCustomCenter"

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v2}, Ljava/io/File;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, " -> (listFiles == null)"

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    :goto_3
    invoke-static {v0, v2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    goto :goto_6

    :cond_5
    const-string v0, "SkywellCustomCenter"

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v2}, Ljava/io/File;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, " -> (File.exists false)"

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2
    :try_end_2
    .catch Ljava/lang/NullPointerException; {:try_start_2 .. :try_end_2} :catch_3
    .catch Ljava/lang/SecurityException; {:try_start_2 .. :try_end_2} :catch_2

    goto :goto_3

    :catch_2
    move-exception v0

    :goto_4
    invoke-virtual {v0}, Ljava/lang/SecurityException;->printStackTrace()V

    goto :goto_6

    :catch_3
    move-exception v0

    :goto_5
    invoke-virtual {v0}, Ljava/lang/NullPointerException;->printStackTrace()V

    :goto_6
    const-string v0, "SkywellCustomCenter"

    const-string v2, "udisk sng file path : "

    invoke-static {v1}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    invoke-static {v0, v2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-object v1
.end method

.method public getUUID()Ljava/lang/String;
    .locals 6

    iget-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->uuid:Ljava/lang/String;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v0

    if-eqz v0, :cond_1

    :cond_0
    :try_start_0
    const-string v0, "android.os.SystemProperties"

    invoke-static {v0}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object v0

    const-string v1, "get"

    const/4 v2, 0x1

    new-array v3, v2, [Ljava/lang/Class;

    const-class v4, Ljava/lang/String;

    const/4 v5, 0x0

    aput-object v4, v3, v5

    invoke-virtual {v0, v1, v3}, Ljava/lang/Class;->getDeclaredMethod(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;

    move-result-object v1

    new-array v2, v2, [Ljava/lang/Object;

    const-string v3, "sys.special.uuid"

    aput-object v3, v2, v5

    invoke-virtual {v1, v0, v2}, Ljava/lang/reflect/Method;->invoke(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Ljava/lang/String;

    iput-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->uuid:Ljava/lang/String;

    const-string v0, "SkywellCustomCenter"

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "uuid is "

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget-object v2, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->uuid:Ljava/lang/String;

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I
    :try_end_0
    .catch Ljava/lang/ClassNotFoundException; {:try_start_0 .. :try_end_0} :catch_3
    .catch Ljava/lang/NoSuchMethodException; {:try_start_0 .. :try_end_0} :catch_2
    .catch Ljava/lang/IllegalAccessException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/reflect/InvocationTargetException; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/reflect/InvocationTargetException;->printStackTrace()V

    goto :goto_0

    :catch_1
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/IllegalAccessException;->printStackTrace()V

    goto :goto_0

    :catch_2
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/NoSuchMethodException;->printStackTrace()V

    goto :goto_0

    :catch_3
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/ClassNotFoundException;->printStackTrace()V

    :cond_1
    :goto_0
    iget-object v0, p0, Lcom/astrob/turbodog/SkywellCustomCenter;->uuid:Ljava/lang/String;

    return-object v0
.end method

.method public getVolumeStreamType()I
    .locals 2

    const-string v0, "SkywellCustomCenter"

    const-string v1, "getVolumeStreamType"

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v0, 0x1

    return v0
.end method

.method public handleProtocal(Landroid/content/Context;Landroid/content/Intent;)V
    .locals 3

    invoke-virtual {p2}, Landroid/content/Intent;->getAction()Ljava/lang/String;

    move-result-object p1

    if-nez p1, :cond_0

    return-void

    :cond_0
    const-string v0, "AUTONAVI_STANDARD_BROADCAST_RECV"

    invoke-virtual {p1, v0}, Ljava/lang/String;->compareTo(Ljava/lang/String;)I

    move-result p1

    if-nez p1, :cond_2

    const-string p1, "KEY_TYPE"

    const/4 v0, 0x0

    invoke-virtual {p2, p1, v0}, Landroid/content/Intent;->getIntExtra(Ljava/lang/String;I)I

    move-result p1

    const-string v1, "EXTRA_HEADLIGHT_STATE"

    const/4 v2, -0x1

    invoke-virtual {p2, v1, v2}, Landroid/content/Intent;->getIntExtra(Ljava/lang/String;I)I

    move-result p2

    const/16 v1, 0x2721

    if-ne p1, v1, :cond_1

    if-nez p2, :cond_1

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->setDNMode(Z)Z

    const-string p1, "SkywellCustomCenter"

    const-string p2, "light on"

    invoke-static {p1, p2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_1
    if-ne p1, v1, :cond_2

    const/4 p1, 0x1

    if-ne p2, p1, :cond_2

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->setDNMode(Z)Z

    const-string p1, "SkywellCustomCenter"

    const-string p2, "light off"

    invoke-static {p1, p2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :cond_2
    return-void
.end method

.method public isExitOnBack()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method

.method public isRenderOnPause()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method

.method public onAppCreate(Landroid/content/Context;)V
    .locals 0

    return-void
.end method

.method public onAppRunStatus(Z)V
    .locals 1

    invoke-super {p0, p1}, Lcom/astrob/turbodog/GenericCustomCenter;->onAppRunStatus(Z)V

    if-eqz p1, :cond_1

    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {p1}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object p1

    :goto_0
    invoke-interface {p1}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-interface {p1}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lcom/astrob/turbodog/b;

    invoke-interface {v0}, Lcom/astrob/turbodog/b;->d()V

    goto :goto_0

    :cond_0
    return-void

    :cond_1
    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {p1}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object p1

    :goto_1
    invoke-interface {p1}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_2

    invoke-interface {p1}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lcom/astrob/turbodog/b;

    invoke-interface {v0}, Lcom/astrob/turbodog/b;->e()V

    goto :goto_1

    :cond_2
    return-void
.end method

.method public onNaviDispatch(Ljava/lang/String;)V
    .locals 9

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0, p1}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string p1, "result"

    invoke-virtual {v0, p1}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result p1

    if-nez p1, :cond_0

    const-string p1, "SkywellCustomCenter"

    const-string v0, "[onNaviDispatch]: Json string is error, no (result) field"

    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_0
    const-string p1, "result"

    invoke-virtual {v0, p1}, Lorg/json/JSONObject;->getJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object p1

    const-string v0, "msgType"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const/4 v1, 0x1

    if-eq v0, v1, :cond_1

    const-string p1, "SkywellCustomCenter"

    const-string v0, "[onNaviDispatch]: ackType is error"

    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_1
    const-string v0, "id"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const/16 v2, 0x65

    if-ne v0, v2, :cond_2

    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object p1

    invoke-virtual {p1}, Lcom/astrob/turbodog/c;->b()V

    return-void

    :cond_2
    const/16 v2, 0x66

    if-eq v0, v2, :cond_a

    const/16 v2, 0x67

    if-ne v0, v2, :cond_3

    goto/16 :goto_2

    :cond_3
    const/16 v2, 0x68

    if-eq v0, v2, :cond_9

    const/16 v2, 0x69

    if-ne v0, v2, :cond_4

    goto/16 :goto_1

    :cond_4
    const/16 v2, 0x6f

    if-ne v0, v2, :cond_7

    const-string v0, "errcode"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const/4 v2, 0x0

    if-nez v0, :cond_5

    const/4 v0, 0x1

    goto :goto_0

    :cond_5
    const/4 v0, 0x0

    :goto_0
    if-eqz v0, :cond_6

    const-string v3, "data"

    invoke-virtual {p1, v3}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v3

    if-eqz v3, :cond_6

    const-string v3, "data"

    invoke-virtual {p1, v3}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result p1

    if-nez p1, :cond_6

    const/4 v2, 0x1

    :cond_6
    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object p1

    invoke-virtual {p1, v0, v2}, Lcom/astrob/turbodog/c;->a(ZZ)V

    return-void

    :cond_7
    const/16 v1, 0x6b

    if-ne v0, v1, :cond_8

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_8

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object p1

    const-string v0, "turnType"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v2

    const-string v0, "turnDis"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v0

    double-to-int v3, v0

    const-string v0, "turnTime"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    const-string v0, "leftDis"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v0

    double-to-int v4, v0

    const-string v0, "leftTime"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v5

    const-string v0, "curName"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    const-string v0, "nextName"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    const-string v0, "roadCls"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v7

    const-string v0, "speed"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v8

    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object v1

    invoke-virtual/range {v1 .. v8}, Lcom/astrob/turbodog/c;->a(IIIILjava/lang/String;II)V

    :cond_8
    return-void

    :cond_9
    :goto_1
    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object p1

    invoke-virtual {p1}, Lcom/astrob/turbodog/c;->d()V

    return-void

    :cond_a
    :goto_2
    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object p1

    invoke-virtual {p1}, Lcom/astrob/turbodog/c;->c()V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    return-void
.end method

.method public onNaviInitStarted()V
    .locals 2

    invoke-static {}, Lcom/astrob/turbodog/c;->a()Lcom/astrob/turbodog/c;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/b;

    invoke-interface {v1}, Lcom/astrob/turbodog/b;->a()V

    goto :goto_0

    :cond_0
    return-void
.end method

.method public onProtocolResponse(Ljava/lang/String;)V
    .locals 10

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0, p1}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string p1, "result"

    invoke-virtual {v0, p1}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result p1

    if-nez p1, :cond_0

    const-string p1, "SkywellCustomCenter"

    const-string v0, "[onProtocolResponse]: Json string is error, no (result) field"

    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_0
    const-string p1, "result"

    invoke-virtual {v0, p1}, Lorg/json/JSONObject;->getJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object p1

    const-string v0, "msgType"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    if-eqz v0, :cond_1

    const-string p1, "SkywellCustomCenter"

    const-string v1, "[onProtocolResponse]: ackType is error, value is "

    invoke-static {v0}, Ljava/lang/String;->valueOf(I)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v1, v0}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :cond_1
    const-string v0, "id"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v0

    const-string v1, "errcode"

    invoke-virtual {p1, v1}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v1

    const/16 v2, 0x15

    const/4 v3, 0x0

    const/4 v4, 0x0

    if-eq v0, v2, :cond_d

    const/16 v2, 0x16

    if-eq v0, v2, :cond_d

    const/16 v2, 0x18

    if-ne v0, v2, :cond_2

    goto/16 :goto_3

    :cond_2
    const/16 v2, 0x17

    if-ne v0, v2, :cond_4

    if-nez v1, :cond_3

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_3

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getJSONArray(Ljava/lang/String;)Lorg/json/JSONArray;

    move-result-object p1

    invoke-virtual {p1}, Lorg/json/JSONArray;->length()I

    move-result v0

    if-lez v0, :cond_3

    invoke-virtual {p1, v4}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object p1

    const-string v0, "name"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    :cond_3
    invoke-static {}, Lcom/astrob/turbodog/e;->a()Lcom/astrob/turbodog/e;

    move-result-object p1

    invoke-virtual {p1, v1, v3}, Lcom/astrob/turbodog/e;->a(ILjava/lang/String;)V

    return-void

    :cond_4
    const/16 v2, 0x19

    if-ne v0, v2, :cond_a

    if-nez v1, :cond_9

    new-instance v3, Ljava/util/ArrayList;

    invoke-direct {v3}, Ljava/util/ArrayList;-><init>()V

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_9

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getJSONArray(Ljava/lang/String;)Lorg/json/JSONArray;

    move-result-object p1

    const/4 v0, 0x0

    :goto_0
    invoke-virtual {p1}, Lorg/json/JSONArray;->length()I

    move-result v2

    if-ge v0, v2, :cond_9

    invoke-virtual {p1, v0}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v2

    new-instance v5, Lcom/astrob/turbodog/f;

    invoke-direct {v5}, Lcom/astrob/turbodog/f;-><init>()V

    const-string v6, "type"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v6

    const-string v7, "recommend"

    const/4 v8, 0x1

    if-nez v6, :cond_5

    const-string v7, "recommend"

    goto :goto_1

    :cond_5
    if-ne v6, v8, :cond_6

    const-string v7, "distance"

    goto :goto_1

    :cond_6
    const/4 v9, 0x2

    if-ne v6, v9, :cond_7

    const-string v7, "time"

    :cond_7
    :goto_1
    iput-object v7, v5, Lcom/astrob/turbodog/f;->a:Ljava/lang/String;

    const-string v6, "time"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v6

    iput-wide v6, v5, Lcom/astrob/turbodog/f;->b:D

    const-string v6, "distance"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v6

    iput-wide v6, v5, Lcom/astrob/turbodog/f;->c:D

    const-string v6, "toll"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v2

    if-ne v2, v8, :cond_8

    goto :goto_2

    :cond_8
    const/4 v8, 0x0

    :goto_2
    iput v8, v5, Lcom/astrob/turbodog/f;->d:I

    invoke-interface {v3, v5}, Ljava/util/List;->add(Ljava/lang/Object;)Z

    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_9
    invoke-static {}, Lcom/astrob/turbodog/e;->a()Lcom/astrob/turbodog/e;

    move-result-object p1

    invoke-virtual {p1, v1, v3}, Lcom/astrob/turbodog/e;->a(ILjava/util/List;)V

    return-void

    :cond_a
    const/16 v2, 0x12

    if-ne v0, v2, :cond_c

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_b

    const-string v0, "data"

    invoke-virtual {p1, v0}, Lorg/json/JSONObject;->getInt(Ljava/lang/String;)I

    move-result v4

    :cond_b
    invoke-static {}, Lcom/astrob/turbodog/e;->a()Lcom/astrob/turbodog/e;

    move-result-object p1

    invoke-virtual {p1, v1, v4}, Lcom/astrob/turbodog/e;->a(II)V

    return-void

    :cond_c
    invoke-static {}, Lcom/astrob/turbodog/e;->a()Lcom/astrob/turbodog/e;

    move-result-object p1

    invoke-virtual {p1, v0, v1}, Lcom/astrob/turbodog/e;->b(II)V

    return-void

    :cond_d
    :goto_3
    if-nez v1, :cond_e

    new-instance v3, Ljava/util/ArrayList;

    invoke-direct {v3}, Ljava/util/ArrayList;-><init>()V

    const-string v2, "data"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_e

    const-string v2, "data"

    invoke-virtual {p1, v2}, Lorg/json/JSONObject;->getJSONArray(Ljava/lang/String;)Lorg/json/JSONArray;

    move-result-object p1

    :goto_4
    invoke-virtual {p1}, Lorg/json/JSONArray;->length()I

    move-result v2

    if-ge v4, v2, :cond_e

    invoke-virtual {p1, v4}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v2

    new-instance v5, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;

    invoke-direct {v5}, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;-><init>()V

    const-string v6, "name"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    iput-object v6, v5, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->name:Ljava/lang/String;

    const-string v6, "address"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    iput-object v6, v5, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->address:Ljava/lang/String;

    const-string v6, "lon"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v6

    iput-wide v6, v5, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->lon:D

    const-string v6, "lat"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v6

    iput-wide v6, v5, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->lat:D

    const-string v6, "distance"

    invoke-virtual {v2, v6}, Lorg/json/JSONObject;->getDouble(Ljava/lang/String;)D

    move-result-wide v6

    double-to-int v2, v6

    int-to-double v6, v2

    iput-wide v6, v5, Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;->distance:D

    invoke-interface {v3, v5}, Ljava/util/List;->add(Ljava/lang/Object;)Z

    add-int/lit8 v4, v4, 0x1

    goto :goto_4

    :cond_e
    invoke-static {}, Lcom/astrob/turbodog/e;->a()Lcom/astrob/turbodog/e;

    move-result-object p1

    invoke-virtual {p1, v0, v1, v3}, Lcom/astrob/turbodog/e;->a(IILjava/util/List;)V
    :try_end_0
    .catch Lorg/json/JSONException; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Lorg/json/JSONException;->printStackTrace()V

    return-void
.end method

.method public regeisteProtocal()Landroid/content/IntentFilter;
    .locals 2

    invoke-super {p0}, Lcom/astrob/turbodog/GenericCustomCenter;->regeisteProtocal()Landroid/content/IntentFilter;

    move-result-object v0

    if-nez v0, :cond_0

    new-instance v0, Landroid/content/IntentFilter;

    invoke-direct {v0}, Landroid/content/IntentFilter;-><init>()V

    :cond_0
    const-string v1, "AUTONAVI_STANDARD_BROADCAST_RECV"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    return-object v0
.end method

.method public requestAudio4Play()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public useAudioTrackBuilder()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method
