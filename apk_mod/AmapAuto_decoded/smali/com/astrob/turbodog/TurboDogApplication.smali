.class public Lcom/astrob/turbodog/TurboDogApplication;
.super Landroid/app/Application;


# instance fields
.field private a:Z

.field private b:I


# direct methods
.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Landroid/app/Application;-><init>()V

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/turbodog/TurboDogApplication;->a:Z

    iput v0, p0, Lcom/astrob/turbodog/TurboDogApplication;->b:I

    return-void
.end method

.method static synthetic a(Lcom/astrob/turbodog/TurboDogApplication;)I
    .locals 2

    iget v0, p0, Lcom/astrob/turbodog/TurboDogApplication;->b:I

    add-int/lit8 v1, v0, 0x1

    iput v1, p0, Lcom/astrob/turbodog/TurboDogApplication;->b:I

    return v0
.end method

.method static synthetic b(Lcom/astrob/turbodog/TurboDogApplication;)Z
    .locals 0

    iget-boolean p0, p0, Lcom/astrob/turbodog/TurboDogApplication;->a:Z

    return p0
.end method

.method static synthetic c(Lcom/astrob/turbodog/TurboDogApplication;)V
    .locals 1

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/astrob/turbodog/TurboDogApplication;->a:Z

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->setAppInBackground(Z)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p0

    iget-object p0, p0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/4 v0, 0x1

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/j;->onAppRunStatus(Z)V

    return-void
.end method

.method static synthetic d(Lcom/astrob/turbodog/TurboDogApplication;)I
    .locals 2

    iget v0, p0, Lcom/astrob/turbodog/TurboDogApplication;->b:I

    add-int/lit8 v1, v0, -0x1

    iput v1, p0, Lcom/astrob/turbodog/TurboDogApplication;->b:I

    return v0
.end method

.method static synthetic e(Lcom/astrob/turbodog/TurboDogApplication;)I
    .locals 0

    iget p0, p0, Lcom/astrob/turbodog/TurboDogApplication;->b:I

    return p0
.end method

.method static synthetic f(Lcom/astrob/turbodog/TurboDogApplication;)V
    .locals 1

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/astrob/turbodog/TurboDogApplication;->a:Z

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->setAppInBackground(Z)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p0

    iget-object p0, p0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/4 v0, 0x0

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/j;->onAppRunStatus(Z)V

    return-void
.end method


# virtual methods
.method public onCreate()V
    .locals 2

    invoke-super {p0}, Landroid/app/Application;->onCreate()V

    const-string v0, "TurboDogApplication"

    const-string v1, "onCreate"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v0, Lcom/astrob/turbodog/TurboDogApplication$1;

    invoke-direct {v0, p0}, Lcom/astrob/turbodog/TurboDogApplication$1;-><init>(Lcom/astrob/turbodog/TurboDogApplication;)V

    invoke-virtual {p0, v0}, Lcom/astrob/turbodog/TurboDogApplication;->registerActivityLifecycleCallbacks(Landroid/app/Application$ActivityLifecycleCallbacks;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    if-nez v0, :cond_0

    invoke-static {}, Lcom/astrob/turbodog/CustomCenterDefine;->getCustomCenter()Lcom/astrob/turbodog/GenericCustomCenter;

    move-result-object v0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v1

    iput-object v0, v1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    :cond_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    if-eqz v0, :cond_1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p0}, Lcom/astrob/navi/astrobnavilib/j;->onAppCreate(Landroid/content/Context;)V

    :cond_1
    return-void
.end method
