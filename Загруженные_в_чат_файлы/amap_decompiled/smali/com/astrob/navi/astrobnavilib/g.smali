.class public Lcom/astrob/navi/astrobnavilib/g;
.super Ljava/lang/Object;


# static fields
.field private static e:Lcom/astrob/navi/astrobnavilib/g;


# instance fields
.field a:Ljava/lang/String;

.field b:Ljava/lang/String;

.field volatile c:Z

.field volatile d:Z

.field private final f:Ljava/lang/String;

.field private g:Ljava/lang/String;

.field private final h:Ljava/lang/Object;


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    invoke-virtual {p0}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->f:Ljava/lang/String;

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->b:Ljava/lang/String;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->g:Ljava/lang/String;

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/g;->c:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/g;->d:Z

    new-instance v0, Ljava/lang/Object;

    invoke-direct {v0}, Ljava/lang/Object;-><init>()V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->h:Ljava/lang/Object;

    return-void
.end method

.method public static a()Lcom/astrob/navi/astrobnavilib/g;
    .locals 2

    sget-object v0, Lcom/astrob/navi/astrobnavilib/g;->e:Lcom/astrob/navi/astrobnavilib/g;

    if-nez v0, :cond_1

    const-class v0, Lcom/astrob/navi/astrobnavilib/g;

    monitor-enter v0

    :try_start_0
    sget-object v1, Lcom/astrob/navi/astrobnavilib/g;->e:Lcom/astrob/navi/astrobnavilib/g;

    if-nez v1, :cond_0

    new-instance v1, Lcom/astrob/navi/astrobnavilib/g;

    invoke-direct {v1}, Lcom/astrob/navi/astrobnavilib/g;-><init>()V

    sput-object v1, Lcom/astrob/navi/astrobnavilib/g;->e:Lcom/astrob/navi/astrobnavilib/g;

    :cond_0
    monitor-exit v0

    goto :goto_0

    :catchall_0
    move-exception v1

    monitor-exit v0
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    throw v1

    :cond_1
    :goto_0
    sget-object v0, Lcom/astrob/navi/astrobnavilib/g;->e:Lcom/astrob/navi/astrobnavilib/g;

    return-object v0
.end method


# virtual methods
.method public final declared-synchronized b()Z
    .locals 15

    monitor-enter p0

    :try_start_0
    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/g;->c:Z

    const/4 v1, 0x1

    if-eqz v0, :cond_0

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->f:Ljava/lang/String;

    const-string v2, "engine has been started"

    invoke-static {v0, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_1

    monitor-exit p0

    return v1

    :cond_0
    const/4 v0, 0x0

    :try_start_1
    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/g;->d:Z

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v2

    iget-object v2, v2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getSdcardPath()Ljava/lang/String;

    move-result-object v3

    iget-object v4, p0, Lcom/astrob/navi/astrobnavilib/g;->f:Ljava/lang/String;

    const-string v5, "sdcardPath="

    invoke-static {v3}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v5, v6}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    invoke-static {v4, v5}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {v3}, Lcom/astrob/navi/astrobnavilib/m;->a(Ljava/lang/String;)Z

    move-result v4

    if-eqz v4, :cond_1

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    sget v2, Lcom/astrob/navi/astrobnavilib/n$a;->nopath_project:I

    invoke-virtual {v1, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v1

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/g;->c:Z
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_1

    monitor-exit p0

    return v0

    :cond_1
    :try_start_2
    new-instance v4, Ljava/lang/StringBuilder;

    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v4, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getNaviRootDir()Ljava/lang/String;

    move-result-object v5

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v5, Ljava/io/File;->separator:Ljava/lang/String;

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v5, "rundir"

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v4

    new-instance v5, Ljava/io/File;

    invoke-direct {v5, v4}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    invoke-virtual {v5}, Ljava/io/File;->exists()Z

    move-result v6

    if-nez v6, :cond_4

    const/4 v6, 0x0

    :goto_0
    if-gtz v6, :cond_3

    add-int/lit8 v6, v6, 0x1

    invoke-static {}, Landroid/os/Environment;->getExternalStorageState()Ljava/lang/String;

    move-result-object v7

    const-string v8, "mounted"

    invoke-virtual {v7, v8}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v7
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_1

    const-wide/16 v8, 0x1f4

    if-eqz v7, :cond_2

    :try_start_3
    invoke-static {v8, v9}, Ljava/lang/Thread;->sleep(J)V
    :try_end_3
    .catch Ljava/lang/InterruptedException; {:try_start_3 .. :try_end_3} :catch_0
    .catchall {:try_start_3 .. :try_end_3} :catchall_1

    goto :goto_1

    :catch_0
    move-exception v6

    :try_start_4
    invoke-virtual {v6}, Ljava/lang/InterruptedException;->printStackTrace()V

    :goto_1
    new-instance v6, Ljava/io/File;

    invoke-direct {v6, v4}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    invoke-virtual {v6}, Ljava/io/File;->exists()Z

    move-result v6
    :try_end_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_1

    if-eqz v6, :cond_3

    goto :goto_2

    :cond_2
    :try_start_5
    invoke-static {v8, v9}, Ljava/lang/Thread;->sleep(J)V
    :try_end_5
    .catch Ljava/lang/InterruptedException; {:try_start_5 .. :try_end_5} :catch_1
    .catchall {:try_start_5 .. :try_end_5} :catchall_1

    goto :goto_0

    :catch_1
    move-exception v7

    :try_start_6
    invoke-virtual {v7}, Ljava/lang/InterruptedException;->printStackTrace()V

    goto :goto_0

    :cond_3
    const/4 v6, 0x0

    goto :goto_3

    :cond_4
    :goto_2
    const/4 v6, 0x1

    :goto_3
    if-nez v6, :cond_13

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getUDiskPath()Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getUDiskRundirDir()Ljava/lang/String;

    move-result-object v7

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getUDiskMapdataDir()Ljava/lang/String;

    move-result-object v8

    if-eqz v6, :cond_5

    invoke-virtual {v6}, Ljava/lang/String;->isEmpty()Z

    move-result v9

    if-nez v9, :cond_5

    const/4 v9, 0x1

    goto :goto_4

    :cond_5
    const/4 v9, 0x0

    :goto_4
    if-eqz v7, :cond_6

    invoke-virtual {v7}, Ljava/lang/String;->isEmpty()Z

    move-result v10

    if-nez v10, :cond_6

    const/4 v10, 0x1

    goto :goto_5

    :cond_6
    const/4 v10, 0x0

    :goto_5
    if-eqz v8, :cond_7

    invoke-virtual {v8}, Ljava/lang/String;->isEmpty()Z

    move-result v8

    if-nez v8, :cond_7

    const/4 v8, 0x1

    goto :goto_6

    :cond_7
    const/4 v8, 0x0

    :goto_6
    if-eqz v9, :cond_12

    if-eqz v10, :cond_12

    if-nez v8, :cond_8

    goto/16 :goto_e

    :cond_8
    const-string v8, ";"

    invoke-virtual {v6, v8}, Ljava/lang/String;->split(Ljava/lang/String;)[Ljava/lang/String;

    move-result-object v6

    array-length v8, v6

    const/4 v9, 0x0

    const/4 v10, 0x0

    const/4 v11, 0x0

    :goto_7
    if-ge v9, v8, :cond_10

    aget-object v12, v6, v9

    new-instance v13, Ljava/io/File;

    invoke-direct {v13, v12}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    invoke-virtual {v13}, Ljava/io/File;->exists()Z

    move-result v14

    if-eqz v14, :cond_f

    invoke-virtual {v13}, Ljava/io/File;->canRead()Z

    move-result v10

    if-nez v10, :cond_9

    const/4 v10, 0x2

    iget-object v11, p0, Lcom/astrob/navi/astrobnavilib/g;->f:Ljava/lang/String;

    new-instance v13, Ljava/lang/StringBuilder;

    const-string v14, "udisk path "

    invoke-direct {v13, v14}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v13, v12}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v12, ":2"

    invoke-virtual {v13, v12}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v13}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v12

    invoke-static {v11, v12}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v10, 0x1

    const/4 v11, 0x2

    goto :goto_9

    :cond_9
    new-instance v10, Ljava/lang/StringBuilder;

    invoke-direct {v10}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v10, v12}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v11, Ljava/io/File;->separator:Ljava/lang/String;

    invoke-virtual {v10, v11}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v10, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v10}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v10

    new-instance v11, Ljava/io/File;

    invoke-direct {v11, v10}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    invoke-virtual {v11}, Ljava/io/File;->exists()Z

    move-result v11

    if-eqz v11, :cond_d

    invoke-virtual {v5}, Ljava/io/File;->mkdirs()Z

    move-result v11

    if-eqz v11, :cond_b

    invoke-virtual {v5}, Ljava/io/File;->delete()Z

    move-result v5

    if-nez v5, :cond_a

    iget-object v5, p0, Lcom/astrob/navi/astrobnavilib/g;->f:Ljava/lang/String;

    new-instance v6, Ljava/lang/StringBuilder;

    const-string v7, "delete "

    invoke-direct {v6, v7}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v6, v10}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v7, " failed"

    invoke-virtual {v6, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v6}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v6

    invoke-static {v5, v6}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    :cond_a
    const/4 v10, 0x1

    const/4 v11, 0x0

    goto :goto_a

    :cond_b
    const/4 v11, 0x5

    invoke-virtual {v5}, Ljava/io/File;->canRead()Z

    move-result v12

    if-eqz v12, :cond_c

    invoke-virtual {v5}, Ljava/io/File;->canWrite()Z

    move-result v12

    if-nez v12, :cond_e

    :cond_c
    const/4 v11, 0x4

    goto :goto_8

    :cond_d
    const/4 v11, 0x3

    :cond_e
    :goto_8
    iget-object v12, p0, Lcom/astrob/navi/astrobnavilib/g;->f:Ljava/lang/String;

    new-instance v13, Ljava/lang/StringBuilder;

    const-string v14, "udisk path "

    invoke-direct {v13, v14}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v13, v10}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v10, ":"

    invoke-virtual {v13, v10}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v13, v11}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v13}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v10

    invoke-static {v12, v10}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v10, 0x1

    :cond_f
    :goto_9
    add-int/lit8 v9, v9, 0x1

    goto/16 :goto_7

    :cond_10
    :goto_a
    if-nez v10, :cond_11

    const/4 v11, 0x1

    :cond_11
    if-eqz v11, :cond_13

    packed-switch v11, :pswitch_data_0

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    goto :goto_c

    :pswitch_0
    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    sget v2, Lcom/astrob/navi/astrobnavilib/n$a;->nocreate_device:I

    invoke-virtual {v1, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v1

    :goto_b
    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;

    goto :goto_d

    :pswitch_1
    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    sget v2, Lcom/astrob/navi/astrobnavilib/n$a;->norw_device:I

    invoke-virtual {v1, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v1

    goto :goto_b

    :pswitch_2
    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    sget v2, Lcom/astrob/navi/astrobnavilib/n$a;->nodata_udisk:I

    invoke-virtual {v1, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v1

    goto :goto_b

    :pswitch_3
    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    sget v2, Lcom/astrob/navi/astrobnavilib/n$a;->noread_udisk:I

    invoke-virtual {v1, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v1

    goto :goto_b

    :goto_c
    sget v2, Lcom/astrob/navi/astrobnavilib/n$a;->nodata_device_canudisk:I

    invoke-virtual {v1, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v1

    goto :goto_b

    :goto_d
    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/g;->c:Z
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_1

    monitor-exit p0

    return v0

    :cond_12
    :goto_e
    :try_start_7
    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getContext()Landroid/content/Context;

    move-result-object v1

    sget v2, Lcom/astrob/navi/astrobnavilib/n$a;->nodata_device:I

    invoke-virtual {v1, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v1

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;
    :try_end_7
    .catchall {:try_start_7 .. :try_end_7} :catchall_1

    monitor-exit p0

    return v0

    :cond_13
    :try_start_8
    invoke-static {v4}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->SetSystemDir(Ljava/lang/String;)V

    invoke-virtual {v2}, Lcom/astrob/navi/astrobnavilib/j;->getSysType()I

    move-result v0

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->setSysType(I)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->OnCreate()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/i;->a()Lcom/astrob/navi/astrobnavilib/i;

    move-result-object v0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/i;->start()V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->f:Ljava/lang/String;

    const-string v2, "engine started"

    invoke-static {v0, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/g;->c:Z

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->h:Ljava/lang/Object;

    monitor-enter v0
    :try_end_8
    .catchall {:try_start_8 .. :try_end_8} :catchall_1

    :try_start_9
    iget-object v2, p0, Lcom/astrob/navi/astrobnavilib/g;->h:Ljava/lang/Object;

    invoke-virtual {v2}, Ljava/lang/Object;->notifyAll()V

    monitor-exit v0
    :try_end_9
    .catchall {:try_start_9 .. :try_end_9} :catchall_0

    :try_start_a
    iput-object v4, p0, Lcom/astrob/navi/astrobnavilib/g;->b:Ljava/lang/String;

    iput-object v3, p0, Lcom/astrob/navi/astrobnavilib/g;->g:Ljava/lang/String;
    :try_end_a
    .catchall {:try_start_a .. :try_end_a} :catchall_1

    monitor-exit p0

    return v1

    :catchall_0
    move-exception v1

    :try_start_b
    monitor-exit v0
    :try_end_b
    .catchall {:try_start_b .. :try_end_b} :catchall_0

    :try_start_c
    throw v1
    :try_end_c
    .catchall {:try_start_c .. :try_end_c} :catchall_1

    :catchall_1
    move-exception v0

    monitor-exit p0

    throw v0

    return-void

    nop

    :pswitch_data_0
    .packed-switch 0x2
        :pswitch_3
        :pswitch_2
        :pswitch_1
        :pswitch_0
    .end packed-switch
.end method

.method public final declared-synchronized c()V
    .locals 2

    monitor-enter p0

    :try_start_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/i;->a()Lcom/astrob/navi/astrobnavilib/i;

    move-result-object v0

    const/4 v1, 0x1

    iput-boolean v1, v0, Lcom/astrob/navi/astrobnavilib/i;->b:Z

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/g;->c:Z

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->g:Ljava/lang/String;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/g;->b:Ljava/lang/String;
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    monitor-exit p0

    return-void

    :catchall_0
    move-exception v0

    monitor-exit p0

    throw v0
.end method
