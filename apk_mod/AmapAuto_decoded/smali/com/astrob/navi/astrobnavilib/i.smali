.class public Lcom/astrob/navi/astrobnavilib/i;
.super Ljava/lang/Thread;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/navi/astrobnavilib/i$a;
    }
.end annotation


# static fields
.field private static i:Lcom/astrob/navi/astrobnavilib/i;


# instance fields
.field public volatile a:I

.field volatile b:Z

.field final c:Ljava/lang/Object;

.field volatile d:Z

.field volatile e:Lcom/astrob/navi/astrobnavilib/i$a;

.field private final f:Ljava/lang/String;

.field private final g:Ljava/lang/Object;

.field private volatile h:Z

.field private j:I

.field private k:Ljavax/microedition/khronos/egl/EGL10;

.field private l:Ljavax/microedition/khronos/egl/EGLDisplay;

.field private m:Ljavax/microedition/khronos/egl/EGLConfig;

.field private n:Ljavax/microedition/khronos/egl/EGLContext;


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method public constructor <init>()V
    .locals 2

    invoke-direct {p0}, Ljava/lang/Thread;-><init>()V

    invoke-virtual {p0}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const/4 v0, -0x1

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/i;->a:I

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/i;->b:Z

    new-instance v1, Ljava/lang/Object;

    invoke-direct {v1}, Ljava/lang/Object;-><init>()V

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/i;->c:Ljava/lang/Object;

    new-instance v1, Ljava/lang/Object;

    invoke-direct {v1}, Ljava/lang/Object;-><init>()V

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/i;->g:Ljava/lang/Object;

    const/4 v1, 0x1

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/i;->d:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/i;->h:Z

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    const/4 v1, 0x4

    iput v1, p0, Lcom/astrob/navi/astrobnavilib/i;->j:I

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->k:Ljavax/microedition/khronos/egl/EGL10;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->l:Ljavax/microedition/khronos/egl/EGLDisplay;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->m:Ljavax/microedition/khronos/egl/EGLConfig;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->n:Ljavax/microedition/khronos/egl/EGLContext;

    return-void
.end method

.method public static a()Lcom/astrob/navi/astrobnavilib/i;
    .locals 2

    sget-object v0, Lcom/astrob/navi/astrobnavilib/i;->i:Lcom/astrob/navi/astrobnavilib/i;

    if-nez v0, :cond_1

    const-class v0, Lcom/astrob/navi/astrobnavilib/i;

    monitor-enter v0

    :try_start_0
    sget-object v1, Lcom/astrob/navi/astrobnavilib/i;->i:Lcom/astrob/navi/astrobnavilib/i;

    if-nez v1, :cond_0

    new-instance v1, Lcom/astrob/navi/astrobnavilib/i;

    invoke-direct {v1}, Lcom/astrob/navi/astrobnavilib/i;-><init>()V

    sput-object v1, Lcom/astrob/navi/astrobnavilib/i;->i:Lcom/astrob/navi/astrobnavilib/i;

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
    sget-object v0, Lcom/astrob/navi/astrobnavilib/i;->i:Lcom/astrob/navi/astrobnavilib/i;

    return-object v0
.end method

.method private a(Z)Z
    .locals 2

    const/4 v0, 0x1

    if-eqz p1, :cond_0

    return v0

    :cond_0
    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/i;->d:Z

    if-eqz p1, :cond_1

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/i;->c:Ljava/lang/Object;

    monitor-enter p1

    :try_start_0
    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/i;->c:Ljava/lang/Object;

    invoke-virtual {v1}, Ljava/lang/Object;->wait()V
    :try_end_0
    .catch Ljava/lang/InterruptedException; {:try_start_0 .. :try_end_0} :catch_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :try_start_1
    monitor-exit p1

    goto :goto_1

    :catchall_0
    move-exception v0

    goto :goto_0

    :catch_0
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/InterruptedException;->printStackTrace()V

    const/4 v0, 0x0

    monitor-exit p1

    return v0

    :goto_0
    monitor-exit p1
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    throw v0

    :cond_1
    :goto_1
    return v0
.end method


# virtual methods
.method public final b()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v1, "notifyEngineInitFinished"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/i;->h:Z

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->g:Ljava/lang/Object;

    monitor-enter v0

    :try_start_0
    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/i;->g:Ljava/lang/Object;

    invoke-virtual {v1}, Ljava/lang/Object;->notifyAll()V

    monitor-exit v0

    return-void

    :catchall_0
    move-exception v1

    monitor-exit v0
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    throw v1
.end method

.method public run()V
    .locals 13

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    iget-boolean v0, v0, Lcom/astrob/navi/astrobnavilib/g;->d:Z

    invoke-direct {p0, v0}, Lcom/astrob/navi/astrobnavilib/i;->a(Z)Z

    move-result v1

    if-nez v1, :cond_0

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v1, "Wait has InterruptedException"

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/b;->a()Lcom/astrob/navi/astrobnavilib/b;

    move-result-object v0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/b;->b()V

    return-void

    :cond_0
    const/4 v1, 0x0

    invoke-static {v1, v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->CreateGL(ZZ)I

    move-result v0

    const/4 v2, 0x1

    if-ne v0, v2, :cond_1

    const/4 v0, 0x1

    goto :goto_0

    :cond_1
    const/4 v0, 0x0

    :goto_0
    const/4 v3, 0x0

    if-nez v0, :cond_2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v4, "CreateGL failed!"

    invoke-static {v0, v4}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/i;->b()V

    goto/16 :goto_4

    :cond_2
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v4, "eglCreate"

    invoke-static {v0, v4}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    new-array v10, v2, [I

    new-array v0, v2, [Ljavax/microedition/khronos/egl/EGLConfig;

    const/16 v4, 0xf

    new-array v7, v4, [I

    const/16 v4, 0x3024

    aput v4, v7, v1

    const/16 v4, 0x8

    aput v4, v7, v2

    const/16 v5, 0x3023

    const/4 v11, 0x2

    aput v5, v7, v11

    const/4 v12, 0x3

    aput v4, v7, v12

    const/16 v5, 0x3022

    const/4 v6, 0x4

    aput v5, v7, v6

    const/4 v5, 0x5

    aput v4, v7, v5

    const/4 v5, 0x6

    const/16 v8, 0x3040

    aput v8, v7, v5

    const/4 v5, 0x7

    iget v8, p0, Lcom/astrob/navi/astrobnavilib/i;->j:I

    aput v8, v7, v5

    const/16 v5, 0x3033

    aput v5, v7, v4

    const/16 v4, 0x9

    aput v6, v7, v4

    const/16 v4, 0xa

    const/16 v5, 0x3025

    aput v5, v7, v4

    const/16 v4, 0xb

    const/16 v5, 0x10

    aput v5, v7, v4

    const/16 v4, 0xc

    const/16 v5, 0x3026

    aput v5, v7, v4

    const/16 v4, 0xd

    aput v6, v7, v4

    const/16 v4, 0xe

    const/16 v5, 0x3038

    aput v5, v7, v4

    invoke-static {}, Ljavax/microedition/khronos/egl/EGLContext;->getEGL()Ljavax/microedition/khronos/egl/EGL;

    move-result-object v4

    check-cast v4, Ljavax/microedition/khronos/egl/EGL10;

    iput-object v4, p0, Lcom/astrob/navi/astrobnavilib/i;->k:Ljavax/microedition/khronos/egl/EGL10;

    iget-object v4, p0, Lcom/astrob/navi/astrobnavilib/i;->k:Ljavax/microedition/khronos/egl/EGL10;

    if-nez v4, :cond_3

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v4, "egl is null"

    :goto_1
    invoke-static {v0, v4}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    goto :goto_2

    :cond_3
    sget-object v5, Ljavax/microedition/khronos/egl/EGL10;->EGL_DEFAULT_DISPLAY:Ljava/lang/Object;

    invoke-interface {v4, v5}, Ljavax/microedition/khronos/egl/EGL10;->eglGetDisplay(Ljava/lang/Object;)Ljavax/microedition/khronos/egl/EGLDisplay;

    move-result-object v4

    iput-object v4, p0, Lcom/astrob/navi/astrobnavilib/i;->l:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v4, p0, Lcom/astrob/navi/astrobnavilib/i;->k:Ljavax/microedition/khronos/egl/EGL10;

    iget-object v5, p0, Lcom/astrob/navi/astrobnavilib/i;->l:Ljavax/microedition/khronos/egl/EGLDisplay;

    invoke-interface {v4, v5, v3}, Ljavax/microedition/khronos/egl/EGL10;->eglInitialize(Ljavax/microedition/khronos/egl/EGLDisplay;[I)Z

    iget-object v5, p0, Lcom/astrob/navi/astrobnavilib/i;->k:Ljavax/microedition/khronos/egl/EGL10;

    iget-object v6, p0, Lcom/astrob/navi/astrobnavilib/i;->l:Ljavax/microedition/khronos/egl/EGLDisplay;

    const/4 v9, 0x1

    move-object v8, v0

    invoke-interface/range {v5 .. v10}, Ljavax/microedition/khronos/egl/EGL10;->eglChooseConfig(Ljavax/microedition/khronos/egl/EGLDisplay;[I[Ljavax/microedition/khronos/egl/EGLConfig;I[I)Z

    aget-object v0, v0, v1

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->m:Ljavax/microedition/khronos/egl/EGLConfig;

    new-array v0, v12, [I

    fill-array-data v0, :array_0

    iget-object v4, p0, Lcom/astrob/navi/astrobnavilib/i;->k:Ljavax/microedition/khronos/egl/EGL10;

    iget-object v5, p0, Lcom/astrob/navi/astrobnavilib/i;->l:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v6, p0, Lcom/astrob/navi/astrobnavilib/i;->m:Ljavax/microedition/khronos/egl/EGLConfig;

    sget-object v7, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {v4, v5, v6, v7, v0}, Ljavax/microedition/khronos/egl/EGL10;->eglCreateContext(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;Ljavax/microedition/khronos/egl/EGLContext;[I)Ljavax/microedition/khronos/egl/EGLContext;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->n:Ljavax/microedition/khronos/egl/EGLContext;

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->n:Ljavax/microedition/khronos/egl/EGLContext;

    sget-object v4, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    if-ne v0, v4, :cond_4

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v4, "eglContext is empty"

    goto :goto_1

    :cond_4
    :goto_2
    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/i;->b:Z

    if-nez v0, :cond_7

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->RunDialog()I

    move-result v0

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/i;->a:I

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/i;->a:I

    if-nez v0, :cond_5

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v4, "RunDialog terminate"

    invoke-static {v0, v4}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    goto :goto_4

    :cond_5
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    if-eqz v0, :cond_4

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    iget v4, p0, Lcom/astrob/navi/astrobnavilib/i;->a:I

    if-ne v11, v4, :cond_6

    const/4 v4, 0x1

    goto :goto_3

    :cond_6
    const/4 v4, 0x0

    :goto_3
    invoke-interface {v0, v4}, Lcom/astrob/navi/astrobnavilib/i$a;->a(Z)V

    goto :goto_2

    :cond_7
    :goto_4
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v4, "will exit"

    invoke-static {v0, v4}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->OnDestroy()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->DestroyGL()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->finalized()V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    if-eqz v0, :cond_8

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    invoke-interface {v0}, Lcom/astrob/navi/astrobnavilib/i$a;->b()V

    iput-object v3, p0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    :cond_8
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/b;->a()Lcom/astrob/navi/astrobnavilib/b;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/b;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->isEmpty()Z

    move-result v0

    xor-int/2addr v0, v2

    if-eqz v0, :cond_9

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/b;->a()Lcom/astrob/navi/astrobnavilib/b;

    move-result-object v0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/b;->b()V

    goto :goto_5

    :cond_9
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/i;->f:Ljava/lang/String;

    const-string v2, "Startup in background failed, will exit..."

    invoke-static {v0, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->destroyAssetManager()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/g;->c()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->a()V

    invoke-static {v1}, Ljava/lang/System;->exit(I)V

    :goto_5
    sput-object v3, Lcom/astrob/navi/astrobnavilib/i;->i:Lcom/astrob/navi/astrobnavilib/i;

    return-void

    nop

    :array_0
    .array-data 4
        0x3098
        0x2
        0x3038
    .end array-data
.end method
