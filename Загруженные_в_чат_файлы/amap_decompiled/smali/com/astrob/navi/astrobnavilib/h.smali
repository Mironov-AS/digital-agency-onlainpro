.class public final Lcom/astrob/navi/astrobnavilib/h;
.super Landroid/view/SurfaceView;

# interfaces
.implements Landroid/view/SurfaceHolder$Callback;
.implements Lcom/astrob/navi/astrobnavilib/i$a;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/navi/astrobnavilib/h$a;
    }
.end annotation


# static fields
.field private static p:Ljavax/microedition/khronos/egl/EGL10;

.field private static q:Ljavax/microedition/khronos/egl/EGLDisplay;

.field private static r:Ljavax/microedition/khronos/egl/EGLConfig;

.field private static s:Ljavax/microedition/khronos/egl/EGLContext;


# instance fields
.field private A:Z

.field private volatile B:Landroid/view/SurfaceHolder;

.field private volatile C:Z

.field private volatile D:Z

.field private volatile E:Z

.field private F:Z

.field final a:Ljava/lang/String;

.field public b:Lcom/astrob/navi/astrobnavilib/h$a;

.field volatile c:Z

.field d:I

.field e:I

.field private f:Landroid/content/Context;

.field private g:I

.field private h:I

.field private i:I

.field private j:I

.field private k:I

.field private l:I

.field private m:Z

.field private n:Z

.field private final o:I

.field private t:Ljavax/microedition/khronos/egl/EGLSurface;

.field private final u:Ljava/lang/Object;

.field private volatile v:Z

.field private w:Z

.field private volatile x:Z

.field private volatile y:Z

.field private volatile z:Z


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method public constructor <init>(Landroid/content/Context;)V
    .locals 1

    const/4 v0, 0x0

    invoke-direct {p0, p1, v0}, Lcom/astrob/navi/astrobnavilib/h;-><init>(Landroid/content/Context;B)V

    return-void
.end method

.method private constructor <init>(Landroid/content/Context;B)V
    .locals 0

    const/4 p2, 0x0

    invoke-direct {p0, p1, p2}, Lcom/astrob/navi/astrobnavilib/h;-><init>(Landroid/content/Context;C)V

    return-void
.end method

.method private constructor <init>(Landroid/content/Context;C)V
    .locals 3

    const/4 p2, 0x0

    const/4 v0, 0x0

    invoke-direct {p0, p1, p2, v0}, Landroid/view/SurfaceView;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;I)V

    invoke-virtual {p0}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v1

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    iput-object p2, p0, Lcom/astrob/navi/astrobnavilib/h;->f:Landroid/content/Context;

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/h;->g:I

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/h;->h:I

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/h;->i:I

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/h;->j:I

    const/4 v1, -0x1

    iput v1, p0, Lcom/astrob/navi/astrobnavilib/h;->k:I

    iput v1, p0, Lcom/astrob/navi/astrobnavilib/h;->l:I

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->m:Z

    const/4 v1, 0x1

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->n:Z

    iput-object p2, p0, Lcom/astrob/navi/astrobnavilib/h;->b:Lcom/astrob/navi/astrobnavilib/h$a;

    const/4 v2, 0x4

    iput v2, p0, Lcom/astrob/navi/astrobnavilib/h;->o:I

    iput-object p2, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    new-instance p2, Ljava/lang/Object;

    invoke-direct {p2}, Ljava/lang/Object;-><init>()V

    iput-object p2, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->v:Z

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->w:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->x:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->y:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->c:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->z:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->A:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->C:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->D:Z

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->E:Z

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->F:Z

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/h;->d:I

    iput v0, p0, Lcom/astrob/navi/astrobnavilib/h;->e:I

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->f:Landroid/content/Context;

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/h;->getHolder()Landroid/view/SurfaceHolder;

    move-result-object p1

    invoke-interface {p1, p0}, Landroid/view/SurfaceHolder;->addCallback(Landroid/view/SurfaceHolder$Callback;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->getMapDensityDpi()I

    move-result p1

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->SetDisplayMetricsGL(I)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {p1}, Lcom/astrob/navi/astrobnavilib/j;->isRenderOnPause()Z

    move-result p1

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->A:Z

    return-void
.end method

.method private static a(Landroid/content/Context;)Ljava/lang/String;
    .locals 3

    const-string v0, ""

    :try_start_0
    invoke-virtual {p0}, Landroid/content/Context;->getAssets()Landroid/content/res/AssetManager;

    move-result-object p0

    const-string v1, "mapscreen.ini"

    invoke-virtual {p0, v1}, Landroid/content/res/AssetManager;->open(Ljava/lang/String;)Ljava/io/InputStream;

    move-result-object p0

    invoke-virtual {p0}, Ljava/io/InputStream;->available()I

    move-result v1

    new-array v2, v1, [B

    invoke-virtual {p0, v2}, Ljava/io/InputStream;->read([B)I

    move-result p0

    if-ne p0, v1, :cond_0

    new-instance p0, Ljava/lang/String;

    invoke-direct {p0, v2}, Ljava/lang/String;-><init>([B)V
    :try_end_0
    .catch Ljava/io/IOException; {:try_start_0 .. :try_end_0} :catch_0

    move-object v0, p0

    goto :goto_0

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Ljava/io/IOException;->printStackTrace()V

    :cond_0
    :goto_0
    return-object v0
.end method

.method private a(Landroid/view/SurfaceHolder;)Z
    .locals 9

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    const/4 v1, 0x0

    const/4 v2, 0x0

    if-nez v0, :cond_1

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v3, "eglCreate"

    invoke-static {v0, v3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v0, 0x1

    new-array v8, v0, [I

    new-array v0, v0, [Ljavax/microedition/khronos/egl/EGLConfig;

    const/16 v3, 0xf

    new-array v5, v3, [I

    fill-array-data v5, :array_0

    invoke-static {}, Ljavax/microedition/khronos/egl/EGLContext;->getEGL()Ljavax/microedition/khronos/egl/EGL;

    move-result-object v3

    check-cast v3, Ljavax/microedition/khronos/egl/EGL10;

    sput-object v3, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    if-nez v3, :cond_0

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v0, "egl is null"

    :goto_0
    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return v2

    :cond_0
    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v4, Ljavax/microedition/khronos/egl/EGL10;->EGL_DEFAULT_DISPLAY:Ljava/lang/Object;

    invoke-interface {v3, v4}, Ljavax/microedition/khronos/egl/EGL10;->eglGetDisplay(Ljava/lang/Object;)Ljavax/microedition/khronos/egl/EGLDisplay;

    move-result-object v3

    sput-object v3, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    invoke-interface {v3, v4, v1}, Ljavax/microedition/khronos/egl/EGL10;->eglInitialize(Ljavax/microedition/khronos/egl/EGLDisplay;[I)Z

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    const/4 v7, 0x1

    move-object v6, v0

    invoke-interface/range {v3 .. v8}, Ljavax/microedition/khronos/egl/EGL10;->eglChooseConfig(Ljavax/microedition/khronos/egl/EGLDisplay;[I[Ljavax/microedition/khronos/egl/EGLConfig;I[I)Z

    aget-object v0, v0, v2

    sput-object v0, Lcom/astrob/navi/astrobnavilib/h;->r:Ljavax/microedition/khronos/egl/EGLConfig;

    const/4 v0, 0x3

    new-array v0, v0, [I

    fill-array-data v0, :array_1

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v5, Lcom/astrob/navi/astrobnavilib/h;->r:Ljavax/microedition/khronos/egl/EGLConfig;

    sget-object v6, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {v3, v4, v5, v6, v0}, Ljavax/microedition/khronos/egl/EGL10;->eglCreateContext(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;Ljavax/microedition/khronos/egl/EGLContext;[I)Ljavax/microedition/khronos/egl/EGLContext;

    move-result-object v0

    sput-object v0, Lcom/astrob/navi/astrobnavilib/h;->s:Ljavax/microedition/khronos/egl/EGLContext;

    sget-object v3, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    if-ne v0, v3, :cond_1

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v0, "eglContext is empty"

    goto :goto_0

    :cond_1
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eqz v0, :cond_2

    sget-object v3, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eq v0, v3, :cond_2

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v4, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v5, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {v0, v3, v4, v4, v5}, Ljavax/microedition/khronos/egl/EGL10;->eglMakeCurrent(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLContext;)Z

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v4, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    invoke-interface {v0, v3, v4}, Ljavax/microedition/khronos/egl/EGL10;->eglDestroySurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;)Z

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    :cond_2
    :try_start_0
    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/h;->r:Ljavax/microedition/khronos/egl/EGLConfig;

    invoke-interface {p1}, Landroid/view/SurfaceHolder;->getSurface()Landroid/view/Surface;

    move-result-object p1

    invoke-interface {v0, v3, v4, p1, v1}, Ljavax/microedition/khronos/egl/EGL10;->eglCreateWindowSurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;Ljava/lang/Object;[I)Ljavax/microedition/khronos/egl/EGLSurface;

    move-result-object p1

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v0, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    if-ne p1, v0, :cond_3

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v0, "eglSurface is empty"

    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return v2

    :cond_3
    sget-object p1, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    iget-object v3, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/h;->s:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {p1, v0, v1, v3, v4}, Ljavax/microedition/khronos/egl/EGL10;->eglMakeCurrent(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLContext;)Z

    move-result p1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return p1

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Ljava/lang/Exception;->printStackTrace()V

    return v2

    :array_0
    .array-data 4
        0x3024
        0x8
        0x3023
        0x8
        0x3022
        0x8
        0x3040
        0x4
        0x3033
        0x4
        0x3025
        0x10
        0x3026
        0x4
        0x3038
    .end array-data

    :array_1
    .array-data 4
        0x3098
        0x2
        0x3038
    .end array-data
.end method

.method private b(Landroid/view/SurfaceHolder;)Z
    .locals 5

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v1, "eglReset"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    sget-object v2, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eq v0, v2, :cond_0

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v3, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v4, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {v0, v2, v3, v3, v4}, Ljavax/microedition/khronos/egl/EGL10;->eglMakeCurrent(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLContext;)Z

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v3, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    invoke-interface {v0, v2, v3}, Ljavax/microedition/khronos/egl/EGL10;->eglDestroySurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;)Z

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    :cond_0
    const/4 v0, 0x0

    :try_start_0
    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/h;->r:Ljavax/microedition/khronos/egl/EGLConfig;

    invoke-interface {p1}, Landroid/view/SurfaceHolder;->getSurface()Landroid/view/Surface;

    move-result-object p1

    invoke-interface {v2, v3, v4, p1, v1}, Ljavax/microedition/khronos/egl/EGL10;->eglCreateWindowSurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;Ljava/lang/Object;[I)Ljavax/microedition/khronos/egl/EGLSurface;

    move-result-object p1

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eqz p1, :cond_2

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v1, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    if-ne p1, v1, :cond_1

    goto :goto_0

    :cond_1
    sget-object p1, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v1, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v2, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    iget-object v3, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v4, Lcom/astrob/navi/astrobnavilib/h;->s:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {p1, v1, v2, v3, v4}, Ljavax/microedition/khronos/egl/EGL10;->eglMakeCurrent(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLContext;)Z

    move-result p1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return p1

    :cond_2
    :goto_0
    return v0

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Ljava/lang/Exception;->printStackTrace()V

    return v0
.end method

.method private c()V
    .locals 4

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v1, "eglDestroySurface"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eqz v0, :cond_0

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v1, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v2, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v3, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {v0, v1, v2, v2, v3}, Ljavax/microedition/khronos/egl/EGL10;->eglMakeCurrent(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLContext;)Z

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v1, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v2, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    invoke-interface {v0, v1, v2}, Ljavax/microedition/khronos/egl/EGL10;->eglDestroySurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;)Z

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    :cond_0
    return-void
.end method


# virtual methods
.method public final a()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v1, "Resume"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->c:Z

    return-void
.end method

.method public final a(Z)V
    .locals 5

    if-nez p1, :cond_0

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->y:Z

    if-nez p1, :cond_0

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->F:Z

    if-nez p1, :cond_0

    iget p1, p0, Lcom/astrob/navi/astrobnavilib/h;->d:I

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/h;->e:I

    if-ge p1, v0, :cond_d

    :cond_0
    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->y:Z

    const/4 v0, 0x1

    const/4 v1, 0x0

    if-eqz p1, :cond_2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->CancelRenderGL()V

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->B:Landroid/view/SurfaceHolder;

    invoke-direct {p0, p1}, Lcom/astrob/navi/astrobnavilib/h;->b(Landroid/view/SurfaceHolder;)Z

    move-result p1

    if-eqz p1, :cond_1

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->y:Z

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->x:Z

    :cond_1
    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->D:Z

    :cond_2
    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->x:Z

    if-eqz p1, :cond_3

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eqz p1, :cond_3

    sget-object p1, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    sget-object v3, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    sget-object v4, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    invoke-interface {p1, v2, v3, v3, v4}, Ljavax/microedition/khronos/egl/EGL10;->eglMakeCurrent(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLContext;)Z

    sget-object p1, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v3, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    invoke-interface {p1, v2, v3}, Ljavax/microedition/khronos/egl/EGL10;->eglDestroySurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;)Z

    const/4 p1, 0x0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    :cond_3
    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eqz p1, :cond_4

    const/4 p1, 0x1

    goto :goto_0

    :cond_4
    const/4 p1, 0x0

    :goto_0
    if-nez p1, :cond_6

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->B:Landroid/view/SurfaceHolder;

    if-eqz p1, :cond_6

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->B:Landroid/view/SurfaceHolder;

    invoke-direct {p0, p1}, Lcom/astrob/navi/astrobnavilib/h;->a(Landroid/view/SurfaceHolder;)Z

    move-result p1

    if-nez p1, :cond_5

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/h;->c()V

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v2, "eglCreate failed"

    invoke-static {p1, v2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :cond_5
    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->E:Z

    :cond_6
    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->x:Z

    if-nez p1, :cond_a

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->y:Z

    if-nez p1, :cond_a

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->c:Z

    if-eqz p1, :cond_7

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->A:Z

    if-nez p1, :cond_7

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->F:Z

    if-nez p1, :cond_7

    iget p1, p0, Lcom/astrob/navi/astrobnavilib/h;->d:I

    iget v2, p0, Lcom/astrob/navi/astrobnavilib/h;->e:I

    if-ge p1, v2, :cond_a

    :cond_7
    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    if-eqz p1, :cond_a

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->z:Z

    if-eqz p1, :cond_8

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->OnResume()V

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->z:Z

    :cond_8
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->RenderGL()V

    sget-object p1, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    iget-object v3, p0, Lcom/astrob/navi/astrobnavilib/h;->t:Ljavax/microedition/khronos/egl/EGLSurface;

    invoke-interface {p1, v2, v3}, Ljavax/microedition/khronos/egl/EGL10;->eglSwapBuffers(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;)Z

    iget p1, p0, Lcom/astrob/navi/astrobnavilib/h;->d:I

    iget v2, p0, Lcom/astrob/navi/astrobnavilib/h;->e:I

    if-ge p1, v2, :cond_9

    add-int/2addr p1, v0

    iput p1, p0, Lcom/astrob/navi/astrobnavilib/h;->d:I

    :cond_9
    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->F:Z

    if-eqz p1, :cond_b

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->F:Z

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v0, "first eglSwapBuffers"

    invoke-static {p1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->b:Lcom/astrob/navi/astrobnavilib/h$a;

    if-eqz p1, :cond_b

    invoke-interface {p1}, Lcom/astrob/navi/astrobnavilib/h$a;->e()V

    goto :goto_1

    :cond_a
    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->z:Z

    if-nez p1, :cond_b

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->OnPause()V

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->z:Z

    :cond_b
    :goto_1
    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->D:Z

    if-eqz p1, :cond_c

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->C:Z

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->D:Z

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    monitor-enter p1

    :try_start_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    invoke-virtual {v0}, Ljava/lang/Object;->notifyAll()V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v2, "notify onSurfaceCreate finished"

    invoke-static {v0, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    monitor-exit p1

    goto :goto_2

    :catchall_0
    move-exception v0

    monitor-exit p1
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    throw v0

    :cond_c
    :goto_2
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object p1

    iget-boolean p1, p1, Lcom/astrob/navi/astrobnavilib/g;->d:Z

    if-eqz p1, :cond_d

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->E:Z

    if-eqz p1, :cond_d

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->E:Z

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    monitor-enter p1

    :try_start_1
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    invoke-virtual {v0}, Ljava/lang/Object;->notifyAll()V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v1, "notify onSurfaceCreate finished"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    monitor-exit p1

    return-void

    :catchall_1
    move-exception v0

    monitor-exit p1
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_1

    throw v0

    :cond_d
    return-void
.end method

.method public final b()V
    .locals 4

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v1, "eglDestroy"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/h;->c()V

    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->s:Ljavax/microedition/khronos/egl/EGLContext;

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    sget-object v3, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    invoke-interface {v2, v3, v0}, Ljavax/microedition/khronos/egl/EGL10;->eglDestroyContext(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLContext;)Z

    sput-object v1, Lcom/astrob/navi/astrobnavilib/h;->s:Ljavax/microedition/khronos/egl/EGLContext;

    :cond_0
    sget-object v0, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    if-eqz v0, :cond_1

    sget-object v2, Lcom/astrob/navi/astrobnavilib/h;->p:Ljavax/microedition/khronos/egl/EGL10;

    invoke-interface {v2, v0}, Ljavax/microedition/khronos/egl/EGL10;->eglTerminate(Ljavax/microedition/khronos/egl/EGLDisplay;)Z

    sput-object v1, Lcom/astrob/navi/astrobnavilib/h;->q:Ljavax/microedition/khronos/egl/EGLDisplay;

    :cond_1
    return-void
.end method

.method public final onTouchEvent(Landroid/view/MotionEvent;)Z
    .locals 18

    move-object/from16 v0, p0

    move-object/from16 v1, p1

    invoke-virtual/range {p1 .. p1}, Landroid/view/MotionEvent;->getAction()I

    move-result v2

    and-int/lit16 v2, v2, 0xff

    invoke-virtual/range {p1 .. p1}, Landroid/view/MotionEvent;->getPointerCount()I

    move-result v3

    const/4 v4, 0x2

    const/4 v5, 0x3

    const/4 v6, 0x0

    const/4 v7, 0x1

    if-ne v2, v5, :cond_0

    if-le v3, v4, :cond_0

    const-string v4, "MapView"

    new-instance v5, Ljava/lang/StringBuilder;

    const-string v8, "action = "

    invoke-direct {v5, v8}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v5, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v2, ", nPointerCount = "

    invoke-virtual {v5, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v5, v3}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v5}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v4, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {v1, v6}, Landroid/view/MotionEvent;->getX(I)F

    move-result v2

    iget v3, v0, Lcom/astrob/navi/astrobnavilib/h;->g:I

    int-to-float v3, v3

    mul-float v2, v2, v3

    iget v3, v0, Lcom/astrob/navi/astrobnavilib/h;->i:I

    int-to-float v3, v3

    div-float/2addr v2, v3

    float-to-int v10, v2

    invoke-virtual {v1, v6}, Landroid/view/MotionEvent;->getY(I)F

    move-result v1

    iget v2, v0, Lcom/astrob/navi/astrobnavilib/h;->h:I

    int-to-float v2, v2

    mul-float v1, v1, v2

    iget v2, v0, Lcom/astrob/navi/astrobnavilib/h;->j:I

    int-to-float v2, v2

    div-float/2addr v1, v2

    float-to-int v11, v1

    const/4 v8, 0x1

    const/4 v9, 0x1

    const/4 v12, 0x0

    const/4 v13, 0x0

    const/4 v14, 0x0

    const/4 v15, 0x0

    invoke-static/range {v8 .. v15}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->AstrobOnMouseAction(IIIIIIII)V

    return v7

    :cond_0
    if-gt v3, v4, :cond_c

    if-gtz v3, :cond_1

    goto/16 :goto_7

    :cond_1
    const/4 v8, -0x1

    if-nez v2, :cond_2

    invoke-virtual/range {p1 .. p1}, Landroid/view/MotionEvent;->getActionIndex()I

    move-result v4

    invoke-virtual {v1, v4}, Landroid/view/MotionEvent;->getPointerId(I)I

    move-result v4

    iput v4, v0, Lcom/astrob/navi/astrobnavilib/h;->k:I

    :goto_0
    iput-boolean v6, v0, Lcom/astrob/navi/astrobnavilib/h;->m:Z

    goto :goto_2

    :cond_2
    const/4 v9, 0x5

    if-ne v2, v9, :cond_3

    invoke-virtual/range {p1 .. p1}, Landroid/view/MotionEvent;->getActionIndex()I

    move-result v4

    invoke-virtual {v1, v4}, Landroid/view/MotionEvent;->getPointerId(I)I

    move-result v4

    iput v4, v0, Lcom/astrob/navi/astrobnavilib/h;->l:I

    iput-boolean v6, v0, Lcom/astrob/navi/astrobnavilib/h;->m:Z

    const/4 v10, 0x0

    goto :goto_4

    :cond_3
    if-ne v2, v7, :cond_4

    iput v8, v0, Lcom/astrob/navi/astrobnavilib/h;->k:I

    iput v8, v0, Lcom/astrob/navi/astrobnavilib/h;->l:I

    goto :goto_0

    :cond_4
    const/4 v9, 0x6

    if-ne v2, v9, :cond_6

    invoke-virtual/range {p1 .. p1}, Landroid/view/MotionEvent;->getActionIndex()I

    move-result v4

    invoke-virtual {v1, v4}, Landroid/view/MotionEvent;->getPointerId(I)I

    move-result v4

    iget v9, v0, Lcom/astrob/navi/astrobnavilib/h;->k:I

    if-ne v4, v9, :cond_5

    iput-boolean v7, v0, Lcom/astrob/navi/astrobnavilib/h;->m:Z

    :cond_5
    :goto_1
    const/4 v10, 0x1

    goto :goto_4

    :cond_6
    if-ne v2, v4, :cond_7

    :goto_2
    move v10, v2

    goto :goto_4

    :cond_7
    if-ne v2, v5, :cond_8

    const-string v4, "MapView"

    const-string v9, "Action cacel"

    :goto_3
    invoke-static {v4, v9}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iput v8, v0, Lcom/astrob/navi/astrobnavilib/h;->k:I

    iput v8, v0, Lcom/astrob/navi/astrobnavilib/h;->l:I

    iput-boolean v6, v0, Lcom/astrob/navi/astrobnavilib/h;->m:Z

    goto :goto_1

    :cond_8
    const/4 v4, 0x4

    if-ne v2, v4, :cond_9

    const-string v4, "MapView"

    const-string v9, "Action outside"

    goto :goto_3

    :cond_9
    const/4 v10, -0x1

    :goto_4
    if-eq v10, v8, :cond_c

    if-ne v3, v7, :cond_a

    invoke-virtual/range {p1 .. p1}, Landroid/view/MotionEvent;->getX()F

    move-result v4

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->g:I

    int-to-float v8, v8

    mul-float v4, v4, v8

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->i:I

    int-to-float v8, v8

    div-float/2addr v4, v8

    float-to-int v4, v4

    invoke-virtual/range {p1 .. p1}, Landroid/view/MotionEvent;->getY()F

    move-result v1

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->h:I

    int-to-float v8, v8

    mul-float v1, v1, v8

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->j:I

    int-to-float v8, v8

    div-float/2addr v1, v8

    float-to-int v1, v1

    move v13, v1

    move v12, v4

    const/4 v14, 0x0

    const/4 v15, 0x0

    goto :goto_5

    :cond_a
    invoke-virtual {v1, v6}, Landroid/view/MotionEvent;->getX(I)F

    move-result v4

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->g:I

    int-to-float v8, v8

    mul-float v4, v4, v8

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->i:I

    int-to-float v8, v8

    div-float/2addr v4, v8

    float-to-int v4, v4

    invoke-virtual {v1, v6}, Landroid/view/MotionEvent;->getY(I)F

    move-result v6

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->h:I

    int-to-float v8, v8

    mul-float v6, v6, v8

    iget v8, v0, Lcom/astrob/navi/astrobnavilib/h;->j:I

    int-to-float v8, v8

    div-float/2addr v6, v8

    float-to-int v6, v6

    invoke-virtual {v1, v7}, Landroid/view/MotionEvent;->getX(I)F

    move-result v8

    iget v9, v0, Lcom/astrob/navi/astrobnavilib/h;->g:I

    int-to-float v9, v9

    mul-float v8, v8, v9

    iget v9, v0, Lcom/astrob/navi/astrobnavilib/h;->i:I

    int-to-float v9, v9

    div-float/2addr v8, v9

    float-to-int v8, v8

    invoke-virtual {v1, v7}, Landroid/view/MotionEvent;->getY(I)F

    move-result v1

    iget v9, v0, Lcom/astrob/navi/astrobnavilib/h;->h:I

    int-to-float v9, v9

    mul-float v1, v1, v9

    iget v9, v0, Lcom/astrob/navi/astrobnavilib/h;->j:I

    int-to-float v9, v9

    div-float/2addr v1, v9

    float-to-int v1, v1

    move v15, v1

    move v12, v4

    move v13, v6

    move v14, v8

    :goto_5
    if-ne v2, v5, :cond_b

    if-le v3, v7, :cond_b

    const/4 v11, 0x1

    goto :goto_6

    :cond_b
    move v11, v3

    :goto_6
    const/16 v16, 0x0

    const/16 v17, 0x0

    invoke-static/range {v10 .. v17}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->AstrobOnMouseAction(IIIIIIII)V

    :cond_c
    :goto_7
    return v7
.end method

.method public final setLaunchViewListener(Lcom/astrob/navi/astrobnavilib/h$a;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->b:Lcom/astrob/navi/astrobnavilib/h$a;

    return-void
.end method

.method public final surfaceChanged(Landroid/view/SurfaceHolder;III)V
    .locals 36

    move-object/from16 v1, p0

    move/from16 v0, p3

    move/from16 v2, p4

    iget v3, v1, Lcom/astrob/navi/astrobnavilib/h;->i:I

    const/4 v4, 0x0

    if-ne v3, v0, :cond_0

    iget v3, v1, Lcom/astrob/navi/astrobnavilib/h;->j:I

    if-eq v3, v2, :cond_18

    :cond_0
    iget-object v3, v1, Lcom/astrob/navi/astrobnavilib/h;->f:Landroid/content/Context;

    iget-boolean v5, v1, Lcom/astrob/navi/astrobnavilib/h;->v:Z

    const/4 v6, 0x1

    if-nez v5, :cond_16

    new-instance v5, Ljava/util/ArrayList;

    invoke-direct {v5}, Ljava/util/ArrayList;-><init>()V

    new-instance v7, Lcom/astrob/navi/astrobnavilib/p;

    const/16 v8, 0x400

    const/16 v9, 0x258

    invoke-direct {v7, v8, v9}, Lcom/astrob/navi/astrobnavilib/p;-><init>(II)V

    new-instance v8, Lcom/astrob/navi/astrobnavilib/p;

    const/16 v9, 0x500

    const/16 v10, 0x2d0

    invoke-direct {v8, v9, v10}, Lcom/astrob/navi/astrobnavilib/p;-><init>(II)V

    new-instance v9, Lcom/astrob/navi/astrobnavilib/p;

    const/16 v11, 0x780

    invoke-direct {v9, v11, v10}, Lcom/astrob/navi/astrobnavilib/p;-><init>(II)V

    new-instance v10, Lcom/astrob/navi/astrobnavilib/p;

    const/16 v11, 0x53a

    const/16 v12, 0x4b0

    invoke-direct {v10, v12, v11}, Lcom/astrob/navi/astrobnavilib/p;-><init>(II)V

    invoke-virtual {v5, v7}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    invoke-virtual {v5, v8}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    invoke-virtual {v5, v9}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    invoke-virtual {v5, v10}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v7

    iget-object v7, v7, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v7}, Lcom/astrob/navi/astrobnavilib/j;->getUIWidth()I

    move-result v8

    invoke-virtual {v7}, Lcom/astrob/navi/astrobnavilib/j;->getUIHeight()I

    move-result v9

    invoke-virtual {v7}, Lcom/astrob/navi/astrobnavilib/j;->getUIWidth()I

    move-result v10

    if-eqz v10, :cond_1

    invoke-virtual {v7}, Lcom/astrob/navi/astrobnavilib/j;->getUIHeight()I

    move-result v10

    if-nez v10, :cond_2

    :cond_1
    invoke-static {v3}, Lcom/astrob/navi/astrobnavilib/h;->a(Landroid/content/Context;)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v3}, Ljava/lang/String;->isEmpty()Z

    move-result v10

    if-nez v10, :cond_2

    const-string v10, ","

    invoke-virtual {v3, v10}, Ljava/lang/String;->split(Ljava/lang/String;)[Ljava/lang/String;

    move-result-object v3

    array-length v10, v3

    const/4 v13, 0x2

    if-ne v10, v13, :cond_2

    aget-object v8, v3, v4

    invoke-static {v8}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v8

    aget-object v3, v3, v6

    invoke-static {v3}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v9

    invoke-virtual {v7, v8}, Lcom/astrob/navi/astrobnavilib/j;->setUIWidth(I)V

    invoke-virtual {v7, v9}, Lcom/astrob/navi/astrobnavilib/j;->setUIHeight(I)V

    :cond_2
    if-eqz v8, :cond_5

    if-eqz v9, :cond_5

    if-ge v8, v9, :cond_3

    iget-object v3, v1, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v5, "navigation can not support stretch or compress by portait"

    invoke-static {v3, v5}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :goto_0
    const/4 v6, 0x0

    goto/16 :goto_b

    :cond_3
    invoke-virtual {v5}, Ljava/util/ArrayList;->iterator()Ljava/util/Iterator;

    move-result-object v3

    :cond_4
    invoke-interface {v3}, Ljava/util/Iterator;->hasNext()Z

    move-result v10

    if-eqz v10, :cond_5

    invoke-interface {v3}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v10

    check-cast v10, Lcom/astrob/navi/astrobnavilib/p;

    iget v13, v10, Lcom/astrob/navi/astrobnavilib/p;->a:I

    if-ne v13, v8, :cond_4

    iget v10, v10, Lcom/astrob/navi/astrobnavilib/p;->b:I

    if-ne v10, v9, :cond_4

    invoke-static {v8, v9}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->OnInit(II)Z

    iget-object v3, v1, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    new-instance v5, Ljava/lang/StringBuilder;

    const-string v7, "device screen size:("

    invoke-direct {v5, v7}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    goto :goto_1

    :cond_5
    invoke-virtual {v5}, Ljava/util/ArrayList;->iterator()Ljava/util/Iterator;

    move-result-object v3

    :cond_6
    invoke-interface {v3}, Ljava/util/Iterator;->hasNext()Z

    move-result v10

    if-eqz v10, :cond_7

    invoke-interface {v3}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v10

    check-cast v10, Lcom/astrob/navi/astrobnavilib/p;

    iget v13, v10, Lcom/astrob/navi/astrobnavilib/p;->a:I

    if-ne v13, v8, :cond_6

    iget v10, v10, Lcom/astrob/navi/astrobnavilib/p;->b:I

    if-ne v10, v9, :cond_6

    invoke-virtual {v7, v8}, Lcom/astrob/navi/astrobnavilib/j;->setUIWidth(I)V

    invoke-virtual {v7, v9}, Lcom/astrob/navi/astrobnavilib/j;->setUIHeight(I)V

    invoke-static {v8, v9}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->OnInit(II)Z

    iget-object v3, v1, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    new-instance v5, Ljava/lang/StringBuilder;

    const-string v7, "device screen size:("

    invoke-direct {v5, v7}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    :goto_1
    invoke-virtual {v5, v8}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v7, ","

    invoke-virtual {v5, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v5, v9}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v7, ")"

    invoke-virtual {v5, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v5}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v5

    invoke-static {v3, v5}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    goto/16 :goto_b

    :cond_7
    int-to-double v8, v0

    const-wide/high16 v13, 0x3ff0000000000000L    # 1.0

    invoke-static {v8, v9}, Ljava/lang/Double;->isNaN(D)Z

    mul-double v8, v8, v13

    const-wide/high16 v15, 0x4094000000000000L    # 1280.0

    div-double v15, v8, v15

    move-object v3, v7

    int-to-double v6, v2

    invoke-static {v6, v7}, Ljava/lang/Double;->isNaN(D)Z

    mul-double v6, v6, v13

    const-wide v13, 0x4086800000000000L    # 720.0

    div-double v13, v6, v13

    invoke-virtual {v5}, Ljava/util/ArrayList;->iterator()Ljava/util/Iterator;

    move-result-object v10

    move-wide/from16 v19, v13

    move-wide/from16 v17, v15

    const/16 v21, 0x0

    const/16 v22, 0x0

    const/16 v23, 0x0

    :goto_2
    invoke-interface {v10}, Ljava/util/Iterator;->hasNext()Z

    move-result v24

    if-eqz v24, :cond_c

    invoke-interface {v10}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v24

    move-object/from16 v4, v24

    check-cast v4, Lcom/astrob/navi/astrobnavilib/p;

    iget v11, v4, Lcom/astrob/navi/astrobnavilib/p;->a:I

    if-ne v11, v12, :cond_9

    iget v11, v4, Lcom/astrob/navi/astrobnavilib/p;->b:I

    const/16 v12, 0x53a

    if-eq v11, v12, :cond_8

    goto :goto_4

    :cond_8
    :goto_3
    const/4 v4, 0x0

    const/16 v11, 0x53a

    const/16 v12, 0x4b0

    goto :goto_2

    :cond_9
    :goto_4
    iget v11, v4, Lcom/astrob/navi/astrobnavilib/p;->a:I

    if-gt v11, v0, :cond_a

    iget v11, v4, Lcom/astrob/navi/astrobnavilib/p;->b:I

    if-gt v11, v2, :cond_a

    iget v11, v4, Lcom/astrob/navi/astrobnavilib/p;->a:I

    int-to-double v11, v11

    invoke-static {v11, v12}, Ljava/lang/Double;->isNaN(D)Z

    div-double v11, v8, v11

    move-object/from16 v25, v10

    iget v10, v4, Lcom/astrob/navi/astrobnavilib/p;->b:I

    move-wide/from16 v26, v13

    int-to-double v13, v10

    invoke-static {v13, v14}, Ljava/lang/Double;->isNaN(D)Z

    div-double v13, v6, v13

    new-instance v10, Ljava/math/BigDecimal;

    sub-double v28, v11, v13

    move-wide/from16 v30, v11

    invoke-static/range {v28 .. v29}, Ljava/lang/Math;->abs(D)D

    move-result-wide v11

    invoke-direct {v10, v11, v12}, Ljava/math/BigDecimal;-><init>(D)V

    new-instance v11, Ljava/math/BigDecimal;

    sub-double v28, v17, v19

    move-wide/from16 v32, v13

    invoke-static/range {v28 .. v29}, Ljava/lang/Math;->abs(D)D

    move-result-wide v12

    invoke-direct {v11, v12, v13}, Ljava/math/BigDecimal;-><init>(D)V

    invoke-virtual {v10, v11}, Ljava/math/BigDecimal;->compareTo(Ljava/math/BigDecimal;)I

    move-result v10

    if-gtz v10, :cond_b

    iget v10, v4, Lcom/astrob/navi/astrobnavilib/p;->a:I

    iget v4, v4, Lcom/astrob/navi/astrobnavilib/p;->b:I

    move/from16 v23, v4

    move/from16 v21, v10

    move-wide/from16 v17, v30

    move-wide/from16 v19, v32

    const/16 v22, 0x1

    goto :goto_5

    :cond_a
    move-object/from16 v25, v10

    move-wide/from16 v26, v13

    :cond_b
    :goto_5
    move-object/from16 v10, v25

    move-wide/from16 v13, v26

    goto :goto_3

    :cond_c
    move-wide/from16 v26, v13

    invoke-virtual {v5}, Ljava/util/ArrayList;->iterator()Ljava/util/Iterator;

    move-result-object v4

    const/4 v5, 0x0

    const/4 v10, 0x0

    const/4 v11, 0x0

    :goto_6
    invoke-interface {v4}, Ljava/util/Iterator;->hasNext()Z

    move-result v12

    if-eqz v12, :cond_11

    invoke-interface {v4}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v12

    check-cast v12, Lcom/astrob/navi/astrobnavilib/p;

    move-object/from16 v25, v4

    iget v4, v12, Lcom/astrob/navi/astrobnavilib/p;->a:I

    move/from16 v26, v10

    const/16 v10, 0x4b0

    if-ne v4, v10, :cond_e

    iget v4, v12, Lcom/astrob/navi/astrobnavilib/p;->b:I

    const/16 v10, 0x53a

    if-eq v4, v10, :cond_d

    goto :goto_7

    :cond_d
    move-object/from16 v4, v25

    move/from16 v10, v26

    goto :goto_6

    :cond_e
    const/16 v10, 0x53a

    :goto_7
    iget v4, v12, Lcom/astrob/navi/astrobnavilib/p;->a:I

    if-lt v4, v0, :cond_f

    iget v4, v12, Lcom/astrob/navi/astrobnavilib/p;->b:I

    if-lt v4, v2, :cond_f

    iget v4, v12, Lcom/astrob/navi/astrobnavilib/p;->a:I

    move/from16 v24, v11

    int-to-double v10, v4

    invoke-static {v10, v11}, Ljava/lang/Double;->isNaN(D)Z

    div-double v10, v8, v10

    iget v4, v12, Lcom/astrob/navi/astrobnavilib/p;->b:I

    move-wide/from16 v28, v8

    int-to-double v8, v4

    invoke-static {v8, v9}, Ljava/lang/Double;->isNaN(D)Z

    div-double v8, v6, v8

    new-instance v4, Ljava/math/BigDecimal;

    sub-double v30, v10, v8

    move-wide/from16 v32, v6

    invoke-static/range {v30 .. v31}, Ljava/lang/Math;->abs(D)D

    move-result-wide v6

    invoke-direct {v4, v6, v7}, Ljava/math/BigDecimal;-><init>(D)V

    new-instance v6, Ljava/math/BigDecimal;

    sub-double v30, v15, v13

    move-wide/from16 v34, v8

    invoke-static/range {v30 .. v31}, Ljava/lang/Math;->abs(D)D

    move-result-wide v7

    invoke-direct {v6, v7, v8}, Ljava/math/BigDecimal;-><init>(D)V

    invoke-virtual {v4, v6}, Ljava/math/BigDecimal;->compareTo(Ljava/math/BigDecimal;)I

    move-result v4

    if-gtz v4, :cond_10

    iget v4, v12, Lcom/astrob/navi/astrobnavilib/p;->a:I

    iget v5, v12, Lcom/astrob/navi/astrobnavilib/p;->b:I

    move-wide v15, v10

    move-wide/from16 v13, v34

    move v10, v4

    move v11, v5

    const/4 v5, 0x1

    goto :goto_8

    :cond_f
    move-wide/from16 v32, v6

    move-wide/from16 v28, v8

    move/from16 v24, v11

    :cond_10
    move/from16 v11, v24

    move/from16 v10, v26

    :goto_8
    move-object/from16 v4, v25

    move-wide/from16 v8, v28

    move-wide/from16 v6, v32

    goto :goto_6

    :cond_11
    move/from16 v26, v10

    move/from16 v24, v11

    if-eqz v22, :cond_12

    if-eqz v5, :cond_12

    new-instance v4, Ljava/math/BigDecimal;

    sub-double v17, v17, v19

    invoke-static/range {v17 .. v18}, Ljava/lang/Math;->abs(D)D

    move-result-wide v5

    invoke-direct {v4, v5, v6}, Ljava/math/BigDecimal;-><init>(D)V

    new-instance v5, Ljava/math/BigDecimal;

    sub-double/2addr v15, v13

    invoke-static/range {v15 .. v16}, Ljava/lang/Math;->abs(D)D

    move-result-wide v6

    invoke-direct {v5, v6, v7}, Ljava/math/BigDecimal;-><init>(D)V

    invoke-virtual {v4, v5}, Ljava/math/BigDecimal;->compareTo(Ljava/math/BigDecimal;)I

    move-result v4

    if-gtz v4, :cond_14

    goto :goto_9

    :cond_12
    if-eqz v22, :cond_13

    :goto_9
    move/from16 v4, v21

    move/from16 v5, v23

    goto :goto_a

    :cond_13
    if-eqz v5, :cond_15

    :cond_14
    move/from16 v5, v24

    move/from16 v4, v26

    :goto_a
    iget-object v6, v1, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    new-instance v7, Ljava/lang/StringBuilder;

    const-string v8, "device screen size:("

    invoke-direct {v7, v8}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v7, v4}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v8, ","

    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v7, v5}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v8, ")"

    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v7}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v7

    invoke-static {v6, v7}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {v3, v4}, Lcom/astrob/navi/astrobnavilib/j;->setUIWidth(I)V

    invoke-virtual {v3, v5}, Lcom/astrob/navi/astrobnavilib/j;->setUIHeight(I)V

    invoke-static {v4, v5}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->OnInit(II)Z

    const/4 v6, 0x1

    goto :goto_b

    :cond_15
    iget-object v3, v1, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    new-instance v4, Ljava/lang/StringBuilder;

    const-string v5, "device screen size is error ("

    invoke-direct {v4, v5}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v4, v0}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v5, ","

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v4, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v5, ")"

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v4

    invoke-static {v3, v4}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    goto/16 :goto_0

    :goto_b
    iput-boolean v6, v1, Lcom/astrob/navi/astrobnavilib/h;->v:Z

    iget-boolean v6, v1, Lcom/astrob/navi/astrobnavilib/h;->v:Z

    goto :goto_c

    :cond_16
    const/4 v6, 0x1

    :goto_c
    if-nez v6, :cond_17

    iget-object v0, v1, Lcom/astrob/navi/astrobnavilib/h;->f:Landroid/content/Context;

    const-string v2, "Set navigation ui screen size failed(get devices real screen size failed)"

    const/4 v3, 0x1

    invoke-static {v0, v2, v3}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/i;->a()Lcom/astrob/navi/astrobnavilib/i;

    move-result-object v0

    iput-boolean v3, v0, Lcom/astrob/navi/astrobnavilib/i;->b:Z

    return-void

    :cond_17
    iput v0, v1, Lcom/astrob/navi/astrobnavilib/h;->i:I

    iput v2, v1, Lcom/astrob/navi/astrobnavilib/h;->j:I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v3

    iget-object v3, v3, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v3}, Lcom/astrob/navi/astrobnavilib/j;->getUIWidth()I

    move-result v4

    iput v4, v1, Lcom/astrob/navi/astrobnavilib/h;->g:I

    invoke-virtual {v3}, Lcom/astrob/navi/astrobnavilib/j;->getUIHeight()I

    move-result v3

    iput v3, v1, Lcom/astrob/navi/astrobnavilib/h;->h:I

    invoke-static/range {p3 .. p4}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->SetWindowSizeGL(II)V

    :cond_18
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/i;->a()Lcom/astrob/navi/astrobnavilib/i;

    move-result-object v0

    iget-boolean v2, v0, Lcom/astrob/navi/astrobnavilib/i;->d:Z

    if-eqz v2, :cond_19

    const/4 v2, 0x0

    iput-boolean v2, v0, Lcom/astrob/navi/astrobnavilib/i;->d:Z

    iget-object v2, v0, Lcom/astrob/navi/astrobnavilib/i;->c:Ljava/lang/Object;

    monitor-enter v2

    :try_start_0
    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/i;->c:Ljava/lang/Object;

    invoke-virtual {v0}, Ljava/lang/Object;->notify()V

    monitor-exit v2

    return-void

    :catchall_0
    move-exception v0

    monitor-exit v2
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    throw v0

    :cond_19
    return-void
.end method

.method public final surfaceCreated(Landroid/view/SurfaceHolder;)V
    .locals 4

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v1, "surfaceCreated"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/h;->n:Z

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->n:Z

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/h;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    invoke-virtual {v0}, Landroid/content/res/Resources;->getDisplayMetrics()Landroid/util/DisplayMetrics;

    move-result-object v0

    iget v2, v0, Landroid/util/DisplayMetrics;->widthPixels:I

    iget v0, v0, Landroid/util/DisplayMetrics;->heightPixels:I

    invoke-virtual {p0, p1, v1, v2, v0}, Lcom/astrob/navi/astrobnavilib/h;->surfaceChanged(Landroid/view/SurfaceHolder;III)V

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v2, "onSurfaceCreate"

    invoke-static {v0, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->B:Landroid/view/SurfaceHolder;

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->w:Z

    if-eqz p1, :cond_1

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->w:Z

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/h;->y:Z

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object p1

    iget-boolean p1, p1, Lcom/astrob/navi/astrobnavilib/g;->d:Z

    if-eqz p1, :cond_3

    iget-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->E:Z

    if-nez p1, :cond_3

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    monitor-enter p1

    :try_start_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    const-wide/16 v2, 0x7d0

    invoke-virtual {v0, v2, v3}, Ljava/lang/Object;->wait(J)V
    :try_end_0
    .catch Ljava/lang/InterruptedException; {:try_start_0 .. :try_end_0} :catch_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :try_start_1
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v2, "wait for onSurfaceCreate finished 1"

    :goto_0
    invoke-static {v0, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_1

    goto :goto_1

    :catchall_0
    move-exception v0

    goto :goto_2

    :catch_0
    move-exception v0

    :try_start_2
    invoke-virtual {v0}, Ljava/lang/InterruptedException;->printStackTrace()V
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    :try_start_3
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v2, "wait for onSurfaceCreate finished 1"

    goto :goto_0

    :goto_1
    monitor-exit p1

    goto :goto_6

    :goto_2
    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v2, "wait for onSurfaceCreate finished 1"

    invoke-static {v1, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    throw v0

    :catchall_1
    move-exception v0

    monitor-exit p1
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_1

    throw v0

    :cond_1
    const/4 p1, 0x1

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->C:Z

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->y:Z

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, v1}, Lcom/astrob/navi/astrobnavilib/j;->setSurfaceViewEnabled(Z)V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    monitor-enter v0

    :goto_3
    :try_start_4
    iget-boolean v2, p0, Lcom/astrob/navi/astrobnavilib/h;->C:Z
    :try_end_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_3

    if-eqz v2, :cond_2

    :try_start_5
    iget-object v2, p0, Lcom/astrob/navi/astrobnavilib/h;->u:Ljava/lang/Object;

    invoke-virtual {v2}, Ljava/lang/Object;->wait()V
    :try_end_5
    .catch Ljava/lang/InterruptedException; {:try_start_5 .. :try_end_5} :catch_1
    .catchall {:try_start_5 .. :try_end_5} :catchall_2

    :try_start_6
    iget-object v2, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v3, "wait for onSurfaceCreate finished 2"

    invoke-static {v2, v3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v2

    iget-object v2, v2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    :goto_4
    invoke-virtual {v2, p1}, Lcom/astrob/navi/astrobnavilib/j;->setSurfaceViewEnabled(Z)V
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_3

    goto :goto_3

    :catchall_2
    move-exception v1

    goto :goto_5

    :catch_1
    move-exception v2

    :try_start_7
    invoke-virtual {v2}, Ljava/lang/InterruptedException;->printStackTrace()V
    :try_end_7
    .catchall {:try_start_7 .. :try_end_7} :catchall_2

    :try_start_8
    iget-object v2, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v3, "wait for onSurfaceCreate finished 2"

    invoke-static {v2, v3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v2

    iget-object v2, v2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    goto :goto_4

    :goto_5
    iget-object v2, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v3, "wait for onSurfaceCreate finished 2"

    invoke-static {v2, v3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v2

    iget-object v2, v2, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v2, p1}, Lcom/astrob/navi/astrobnavilib/j;->setSurfaceViewEnabled(Z)V

    throw v1

    :cond_2
    monitor-exit v0
    :try_end_8
    .catchall {:try_start_8 .. :try_end_8} :catchall_3

    :cond_3
    :goto_6
    invoke-static {v1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->setAppInBackground(Z)V

    return-void

    :catchall_3
    move-exception p1

    :try_start_9
    monitor-exit v0
    :try_end_9
    .catchall {:try_start_9 .. :try_end_9} :catchall_3

    throw p1

    return-void
.end method

.method public final surfaceDestroyed(Landroid/view/SurfaceHolder;)V
    .locals 2

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v0, "surfaceDestroyed"

    invoke-static {p1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 p1, 0x1

    iput-boolean p1, p0, Lcom/astrob/navi/astrobnavilib/h;->x:Z

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/h;->B:Landroid/view/SurfaceHolder;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Lcom/astrob/navi/astrobnavilib/j;->setSurfaceViewEnabled(Z)V

    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->setAppInBackground(Z)V

    return-void
.end method
