.class public abstract Lcom/astrob/navi/astrobnavilib/e;
.super Landroid/app/Activity;

# interfaces
.implements Landroid/support/v4/app/a$a;
.implements Lcom/astrob/navi/astrobnavilib/a;
.implements Lcom/astrob/navi/astrobnavilib/h$a;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/navi/astrobnavilib/e$b;,
        Lcom/astrob/navi/astrobnavilib/e$d;,
        Lcom/astrob/navi/astrobnavilib/e$a;,
        Lcom/astrob/navi/astrobnavilib/e$c;,
        Lcom/astrob/navi/astrobnavilib/e$e;
    }
.end annotation


# static fields
.field private static i:I = 0x1


# instance fields
.field protected a:Landroid/widget/FrameLayout;

.field protected b:I

.field protected c:Lcom/astrob/navi/astrobnavilib/InputTextView;

.field protected d:Landroid/widget/ImageView;

.field protected e:Landroid/widget/LinearLayout;

.field protected f:Landroid/widget/TextView;

.field protected g:Landroid/widget/Button;

.field private final h:Ljava/lang/String;

.field private j:Lcom/astrob/navi/astrobnavilib/h;

.field private k:Lcom/astrob/navi/astrobnavilib/e$e;

.field private l:Lcom/astrob/navi/astrobnavilib/e$c;

.field private m:Lcom/astrob/navi/astrobnavilib/e$a;

.field private n:Ljava/lang/String;

.field private o:Landroid/os/Handler;

.field private p:Landroid/database/ContentObserver;

.field private q:Z

.field private r:Landroid/view/View$OnClickListener;

.field private s:I

.field private t:Ljava/util/Timer;


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method public constructor <init>()V
    .locals 2

    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    invoke-virtual {p0}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->a:Landroid/widget/FrameLayout;

    const/4 v1, -0x1

    iput v1, p0, Lcom/astrob/navi/astrobnavilib/e;->b:I

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->j:Lcom/astrob/navi/astrobnavilib/h;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->k:Lcom/astrob/navi/astrobnavilib/e$e;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->l:Lcom/astrob/navi/astrobnavilib/e$c;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->m:Lcom/astrob/navi/astrobnavilib/e$a;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->n:Ljava/lang/String;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->o:Landroid/os/Handler;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->p:Landroid/database/ContentObserver;

    const/4 v1, 0x0

    iput-boolean v1, p0, Lcom/astrob/navi/astrobnavilib/e;->q:Z

    new-instance v1, Lcom/astrob/navi/astrobnavilib/e$2;

    invoke-direct {v1, p0}, Lcom/astrob/navi/astrobnavilib/e$2;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->r:Landroid/view/View$OnClickListener;

    const/16 v1, 0xa

    iput v1, p0, Lcom/astrob/navi/astrobnavilib/e;->s:I

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->t:Ljava/util/Timer;

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "MQNaviActivity"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method static synthetic a(Ljava/lang/String;Landroid/content/ContentResolver;Ljava/lang/String;)I
    .locals 0

    invoke-static {p0, p1, p2}, Lcom/astrob/navi/astrobnavilib/e;->b(Ljava/lang/String;Landroid/content/ContentResolver;Ljava/lang/String;)I

    move-result p0

    return p0
.end method

.method static synthetic a(Lcom/astrob/navi/astrobnavilib/e;Ljava/lang/String;)Ljava/lang/String;
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/e;->n:Ljava/lang/String;

    return-object p1
.end method

.method static synthetic a(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Timer;
    .locals 0

    iget-object p0, p0, Lcom/astrob/navi/astrobnavilib/e;->t:Ljava/util/Timer;

    return-object p0
.end method

.method static synthetic a(Lcom/astrob/navi/astrobnavilib/e;Z)V
    .locals 2

    invoke-static {}, Landroid/os/Message;->obtain()Landroid/os/Message;

    move-result-object v0

    const/4 v1, 0x3

    iput v1, v0, Landroid/os/Message;->what:I

    iput p1, v0, Landroid/os/Message;->arg1:I

    iget-object p0, p0, Lcom/astrob/navi/astrobnavilib/e;->o:Landroid/os/Handler;

    if-eqz p0, :cond_0

    invoke-virtual {p0, v0}, Landroid/os/Handler;->sendMessage(Landroid/os/Message;)Z

    :cond_0
    return-void
.end method

.method private static b(Ljava/lang/String;Landroid/content/ContentResolver;Ljava/lang/String;)I
    .locals 6

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v0, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p0, "/"

    invoke-virtual {v0, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    invoke-static {p0}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v1

    const/4 v2, 0x0

    const/4 v3, 0x0

    const/4 v4, 0x0

    const/4 v5, 0x0

    move-object v0, p1

    invoke-virtual/range {v0 .. v5}, Landroid/content/ContentResolver;->query(Landroid/net/Uri;[Ljava/lang/String;Ljava/lang/String;[Ljava/lang/String;Ljava/lang/String;)Landroid/database/Cursor;

    move-result-object p0

    const/4 p1, 0x0

    if-eqz p0, :cond_0

    invoke-interface {p0}, Landroid/database/Cursor;->moveToNext()Z

    const/4 v0, 0x1

    :try_start_0
    invoke-interface {p0, v0}, Landroid/database/Cursor;->getInt(I)I

    move-result p1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    const-string v0, "MQNaviActivity"

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "status "

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v1, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p2, "is not a valid integer."

    invoke-virtual {v1, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p2

    invoke-static {v0, p2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :goto_0
    invoke-interface {p0}, Landroid/database/Cursor;->close()V

    :cond_0
    return p1
.end method

.method static synthetic b(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Timer;
    .locals 1

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->t:Ljava/util/Timer;

    return-object v0
.end method

.method static synthetic c(Lcom/astrob/navi/astrobnavilib/e;)I
    .locals 0

    iget p0, p0, Lcom/astrob/navi/astrobnavilib/e;->s:I

    return p0
.end method

.method static synthetic d(Lcom/astrob/navi/astrobnavilib/e;)Landroid/os/Handler;
    .locals 0

    iget-object p0, p0, Lcom/astrob/navi/astrobnavilib/e;->o:Landroid/os/Handler;

    return-object p0
.end method

.method static synthetic e(Lcom/astrob/navi/astrobnavilib/e;)I
    .locals 2

    iget v0, p0, Lcom/astrob/navi/astrobnavilib/e;->s:I

    add-int/lit8 v1, v0, -0x1

    iput v1, p0, Lcom/astrob/navi/astrobnavilib/e;->s:I

    return v0
.end method

.method static synthetic f(Lcom/astrob/navi/astrobnavilib/e;)Lcom/astrob/navi/astrobnavilib/h;
    .locals 0

    iget-object p0, p0, Lcom/astrob/navi/astrobnavilib/e;->j:Lcom/astrob/navi/astrobnavilib/h;

    return-object p0
.end method

.method static synthetic g(Lcom/astrob/navi/astrobnavilib/e;)V
    .locals 0

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/e;->i()V

    return-void
.end method

.method static synthetic h(Lcom/astrob/navi/astrobnavilib/e;)Ljava/util/Locale;
    .locals 0

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/e;->j()Ljava/util/Locale;

    move-result-object p0

    return-object p0
.end method

.method private h()V
    .locals 2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    iget-boolean v0, v0, Lcom/astrob/navi/astrobnavilib/g;->c:Z

    if-nez v0, :cond_1

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->getAssets()Landroid/content/res/AssetManager;

    move-result-object v0

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->createAssetManager(Landroid/content/res/AssetManager;)V

    invoke-static {}, Landroid/os/Environment;->getExternalStorageState()Ljava/lang/String;

    move-result-object v0

    const-string v1, "mounted"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/g;->b()Z

    move-result v0

    if-nez v0, :cond_1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/g;->a:Ljava/lang/String;

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/e;->a(Ljava/lang/String;)V

    return-void

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "ExternalStorage is not mounted"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v0, Lcom/astrob/navi/astrobnavilib/e$d;

    invoke-direct {v0, p0}, Lcom/astrob/navi/astrobnavilib/e$d;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/e$d;->start()V

    return-void

    :cond_1
    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/c;->a(Landroid/content/Context;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/g;->b:Ljava/lang/String;

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->n:Ljava/lang/String;

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/e;->i()V

    return-void
.end method

.method private i()V
    .locals 5

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->n:Ljava/lang/String;

    invoke-static {p0, v0}, Lcom/astrob/navi/astrobnavilib/o;->a(Landroid/content/Context;Ljava/lang/String;)V

    new-instance v0, Lcom/astrob/navi/astrobnavilib/h;

    invoke-direct {v0, p0}, Lcom/astrob/navi/astrobnavilib/h;-><init>(Landroid/content/Context;)V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->j:Lcom/astrob/navi/astrobnavilib/h;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/i;->a()Lcom/astrob/navi/astrobnavilib/i;

    move-result-object v0

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->j:Lcom/astrob/navi/astrobnavilib/h;

    iput-object v1, v0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    invoke-virtual {v1, p0}, Lcom/astrob/navi/astrobnavilib/h;->setLaunchViewListener(Lcom/astrob/navi/astrobnavilib/h$a;)V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->a:Landroid/widget/FrameLayout;

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->j:Lcom/astrob/navi/astrobnavilib/h;

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Landroid/widget/FrameLayout;->addView(Landroid/view/View;I)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isEngineRunning()Z

    move-result v0

    if-nez v0, :cond_0

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->d:Landroid/widget/ImageView;

    invoke-virtual {v0, v2}, Landroid/widget/ImageView;->setVisibility(I)V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "LaunchImgView show"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    :cond_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->regeisteProtocal()Landroid/content/IntentFilter;

    move-result-object v0

    if-eqz v0, :cond_1

    new-instance v1, Lcom/astrob/navi/astrobnavilib/e$c;

    invoke-direct {v1, p0, v2}, Lcom/astrob/navi/astrobnavilib/e$c;-><init>(Lcom/astrob/navi/astrobnavilib/e;B)V

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->l:Lcom/astrob/navi/astrobnavilib/e$c;

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->l:Lcom/astrob/navi/astrobnavilib/e$c;

    invoke-virtual {p0, v1, v0}, Lcom/astrob/navi/astrobnavilib/e;->registerReceiver(Landroid/content/BroadcastReceiver;Landroid/content/IntentFilter;)Landroid/content/Intent;

    :cond_1
    new-instance v0, Lcom/astrob/navi/astrobnavilib/e$a;

    invoke-direct {v0, p0, v2}, Lcom/astrob/navi/astrobnavilib/e$a;-><init>(Lcom/astrob/navi/astrobnavilib/e;B)V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->m:Lcom/astrob/navi/astrobnavilib/e$a;

    new-instance v0, Landroid/content/IntentFilter;

    invoke-direct {v0}, Landroid/content/IntentFilter;-><init>()V

    const-string v1, "EXIT_ACTION"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "SHOW_SYS_KEYBOARD"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "HIDE_SYS_KEYBOARD"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "UPDATE_SYS_KEYBOARD_CURSOR"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "CLEAR_SYS_KEYBOARD"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "INIT_SYS_KEYBOARD"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "MOVE_TASK_TO_BACK"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "MOVE_TASK_TO_FRONT"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "RESUME_MAPVIEW"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "android.intent.action.LOCALE_CHANGED"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->m:Lcom/astrob/navi/astrobnavilib/e$a;

    invoke-virtual {p0, v1, v0}, Lcom/astrob/navi/astrobnavilib/e;->registerReceiver(Landroid/content/BroadcastReceiver;Landroid/content/IntentFilter;)Landroid/content/Intent;

    new-instance v0, Lcom/astrob/navi/astrobnavilib/e$e;

    invoke-direct {v0, p0}, Lcom/astrob/navi/astrobnavilib/e$e;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->k:Lcom/astrob/navi/astrobnavilib/e$e;

    new-instance v0, Landroid/content/IntentFilter;

    invoke-direct {v0}, Landroid/content/IntentFilter;-><init>()V

    const-string v1, "android.intent.action.MEDIA_MOUNTED"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "android.intent.action.MEDIA_UNMOUNTED"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "android.intent.action.MEDIA_REMOVED"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "android.intent.action.MEDIA_EJECT"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    const-string v1, "file"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addDataScheme(Ljava/lang/String;)V

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->k:Lcom/astrob/navi/astrobnavilib/e$e;

    const-string v3, "android.permission.READ_EXTERNAL_STORAGE"

    const/4 v4, 0x0

    invoke-virtual {p0, v1, v0, v3, v4}, Lcom/astrob/navi/astrobnavilib/e;->registerReceiver(Landroid/content/BroadcastReceiver;Landroid/content/IntentFilter;Ljava/lang/String;Landroid/os/Handler;)Landroid/content/Intent;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isUseContentProvider()Z

    move-result v0

    if-eqz v0, :cond_2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getContentProviderUri()Ljava/lang/String;

    move-result-object v0

    if-eqz v0, :cond_2

    new-instance v0, Lcom/astrob/navi/astrobnavilib/e$4;

    invoke-direct {v0, p0}, Lcom/astrob/navi/astrobnavilib/e$4;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->p:Landroid/database/ContentObserver;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->getContentProviderUri()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v0

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    iget-object v3, p0, Lcom/astrob/navi/astrobnavilib/e;->p:Landroid/database/ContentObserver;

    invoke-virtual {v1, v0, v2, v3}, Landroid/content/ContentResolver;->registerContentObserver(Landroid/net/Uri;ZLandroid/database/ContentObserver;)V

    :cond_2
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isOpenService()Z

    move-result v0

    if-eqz v0, :cond_3

    new-instance v0, Landroid/content/Intent;

    const-class v1, Lcom/astrob/navi/astrobnavilib/f;

    invoke-direct {v0, p0, v1}, Landroid/content/Intent;-><init>(Landroid/content/Context;Ljava/lang/Class;)V

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/e;->startService(Landroid/content/Intent;)Landroid/content/ComponentName;

    :cond_3
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p0}, Lcom/astrob/navi/astrobnavilib/j;->setNetworkStatus(Landroid/content/Context;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->doInit()V

    return-void
.end method

.method private j()Ljava/util/Locale;
    .locals 2

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x18

    if-lt v0, v1, :cond_0

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    invoke-virtual {v0}, Landroid/content/res/Resources;->getConfiguration()Landroid/content/res/Configuration;

    move-result-object v0

    invoke-virtual {v0}, Landroid/content/res/Configuration;->getLocales()Landroid/os/LocaleList;

    move-result-object v0

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/os/LocaleList;->get(I)Ljava/util/Locale;

    move-result-object v0

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    invoke-virtual {v0}, Landroid/content/res/Resources;->getConfiguration()Landroid/content/res/Configuration;

    move-result-object v0

    iget-object v0, v0, Landroid/content/res/Configuration;->locale:Ljava/util/Locale;

    :goto_0
    return-object v0
.end method


# virtual methods
.method public final a()V
    .locals 2

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/e;->q:Z

    if-nez v0, :cond_0

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->o:Landroid/os/Handler;

    const/16 v1, 0x66

    invoke-virtual {v0, v1}, Landroid/os/Handler;->sendEmptyMessage(I)Z

    :cond_0
    return-void
.end method

.method protected final a(Ljava/lang/String;)V
    .locals 6

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->g:Landroid/widget/Button;

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->r:Landroid/view/View$OnClickListener;

    invoke-virtual {v0, v1}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->e:Landroid/widget/LinearLayout;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setVisibility(I)V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->f:Landroid/widget/TextView;

    invoke-virtual {v0, p1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e;->g:Landroid/widget/Button;

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/e;->j()Ljava/util/Locale;

    move-result-object v0

    const-string v2, "%s(%d%s)"

    const/4 v3, 0x3

    new-array v3, v3, [Ljava/lang/Object;

    sget v4, Lcom/astrob/navi/astrobnavilib/n$a;->quit:I

    invoke-virtual {p0, v4}, Lcom/astrob/navi/astrobnavilib/e;->getString(I)Ljava/lang/String;

    move-result-object v4

    aput-object v4, v3, v1

    iget v1, p0, Lcom/astrob/navi/astrobnavilib/e;->s:I

    invoke-static {v1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v1

    const/4 v4, 0x1

    aput-object v1, v3, v4

    sget v1, Lcom/astrob/navi/astrobnavilib/n$a;->second_unit:I

    invoke-virtual {p0, v1}, Lcom/astrob/navi/astrobnavilib/e;->getString(I)Ljava/lang/String;

    move-result-object v1

    const/4 v4, 0x2

    aput-object v1, v3, v4

    invoke-static {v0, v2, v3}, Ljava/lang/String;->format(Ljava/util/Locale;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p1, v0}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V

    new-instance p1, Ljava/util/Timer;

    invoke-direct {p1}, Ljava/util/Timer;-><init>()V

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/e;->t:Ljava/util/Timer;

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->t:Ljava/util/Timer;

    new-instance v1, Lcom/astrob/navi/astrobnavilib/e$3;

    invoke-direct {v1, p0}, Lcom/astrob/navi/astrobnavilib/e$3;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    const-wide/16 v2, 0x0

    const-wide/16 v4, 0x3e8

    invoke-virtual/range {v0 .. v5}, Ljava/util/Timer;->schedule(Ljava/util/TimerTask;JJ)V

    return-void
.end method

.method public abstract b()V
.end method

.method public abstract c()V
.end method

.method public final d()Ljava/lang/String;
    .locals 1

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->c:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/InputTextView;->getText()Landroid/text/Editable;

    move-result-object v0

    if-nez v0, :cond_0

    const-string v0, ""

    return-object v0

    :cond_0
    invoke-virtual {v0}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public final e()V
    .locals 2

    invoke-static {}, Landroid/os/Message;->obtain()Landroid/os/Message;

    move-result-object v0

    const/4 v1, 0x4

    iput v1, v0, Landroid/os/Message;->what:I

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->o:Landroid/os/Handler;

    invoke-virtual {v1, v0}, Landroid/os/Handler;->sendMessage(Landroid/os/Message;)Z

    return-void
.end method

.method protected final f()V
    .locals 1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/b;->a()Lcom/astrob/navi/astrobnavilib/b;

    move-result-object v0

    invoke-virtual {v0, p0}, Lcom/astrob/navi/astrobnavilib/b;->a(Lcom/astrob/navi/astrobnavilib/a;)V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0, p0}, Lcom/astrob/navi/astrobnavilib/j;->setContext(Landroid/content/Context;)V

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/e;->h()V

    return-void
.end method

.method protected final g()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "doExit"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/e;->q:Z

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->destroyAssetManager()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/g;->a()Lcom/astrob/navi/astrobnavilib/g;

    move-result-object v0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/g;->c()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->a()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/o;->a()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->isOpenService()Z

    move-result v0

    if-eqz v0, :cond_0

    new-instance v0, Landroid/content/Intent;

    const-class v1, Lcom/astrob/navi/astrobnavilib/f;

    invoke-direct {v0, p0, v1}, Landroid/content/Intent;-><init>(Landroid/content/Context;Ljava/lang/Class;)V

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/e;->stopService(Landroid/content/Intent;)Z

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->p:Landroid/database/ContentObserver;

    if-eqz v0, :cond_1

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v0

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/e;->p:Landroid/database/ContentObserver;

    invoke-virtual {v0, v1}, Landroid/content/ContentResolver;->unregisterContentObserver(Landroid/database/ContentObserver;)V

    :cond_1
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->finalize()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->doUnInit()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Lcom/astrob/navi/astrobnavilib/j;->setContext(Landroid/content/Context;)V

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->finish()V

    return-void
.end method

.method protected onActivityResult(IILandroid/content/Intent;)V
    .locals 0

    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onActivityResult(IILandroid/content/Intent;)V

    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "onCreate"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->getWindow()Landroid/view/Window;

    move-result-object p1

    const/16 v0, 0x80

    invoke-virtual {p1, v0, v0}, Landroid/view/Window;->setFlags(II)V

    const p1, 0x7f09001c

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/e;->setContentView(I)V

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->b()V

    new-instance p1, Lcom/astrob/navi/astrobnavilib/e$b;

    invoke-direct {p1, p0}, Lcom/astrob/navi/astrobnavilib/e$b;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/e;->o:Landroid/os/Handler;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    sget v0, Lcom/astrob/navi/astrobnavilib/e;->i:I

    invoke-virtual {p1, p0, v0}, Lcom/astrob/navi/astrobnavilib/j;->checkPermission(Landroid/content/Context;I)Z

    move-result p1

    if-eqz p1, :cond_0

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->f()V

    :cond_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/4 v0, 0x1

    invoke-virtual {p1, v0}, Lcom/astrob/navi/astrobnavilib/j;->setAppActivityStartup(Z)V

    return-void
.end method

.method protected onDestroy()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "onDestroy"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/i;->a()Lcom/astrob/navi/astrobnavilib/i;

    move-result-object v0

    const/4 v1, 0x0

    iput-object v1, v0, Lcom/astrob/navi/astrobnavilib/i;->e:Lcom/astrob/navi/astrobnavilib/i$a;

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->l:Lcom/astrob/navi/astrobnavilib/e$c;

    if-eqz v0, :cond_0

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/e;->unregisterReceiver(Landroid/content/BroadcastReceiver;)V

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->m:Lcom/astrob/navi/astrobnavilib/e$a;

    if-eqz v0, :cond_1

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/e;->unregisterReceiver(Landroid/content/BroadcastReceiver;)V

    :cond_1
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->k:Lcom/astrob/navi/astrobnavilib/e$e;

    if-eqz v0, :cond_2

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/e;->unregisterReceiver(Landroid/content/BroadcastReceiver;)V

    :cond_2
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/b;->a()Lcom/astrob/navi/astrobnavilib/b;

    move-result-object v0

    invoke-virtual {v0, p0}, Lcom/astrob/navi/astrobnavilib/b;->b(Lcom/astrob/navi/astrobnavilib/a;)Z

    move-result v1

    if-eqz v1, :cond_3

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/b;->a:Ljava/util/Vector;

    invoke-virtual {v0, p0}, Ljava/util/Vector;->remove(Ljava/lang/Object;)Z

    :cond_3
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Lcom/astrob/navi/astrobnavilib/j;->setAppActivityStartup(Z)V

    invoke-super {p0}, Landroid/app/Activity;->onDestroy()V

    iget-boolean v0, p0, Lcom/astrob/navi/astrobnavilib/e;->q:Z

    if-eqz v0, :cond_4

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onAppDestroy()V

    :cond_4
    return-void
.end method

.method public onKeyDown(ILandroid/view/KeyEvent;)Z
    .locals 1

    const/4 v0, 0x4

    if-ne p1, v0, :cond_0

    const/16 p1, 0x8

    const/4 p2, 0x0

    const/4 v0, 0x1

    invoke-static {v0, p1, p2, p2}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->AstrobOnKeyEvent(IIII)I

    return v0

    :cond_0
    invoke-super {p0, p1, p2}, Landroid/app/Activity;->onKeyDown(ILandroid/view/KeyEvent;)Z

    move-result p1

    return p1
.end method

.method protected onNewIntent(Landroid/content/Intent;)V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "onNewIntent"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-super {p0, p1}, Landroid/app/Activity;->onNewIntent(Landroid/content/Intent;)V

    return-void
.end method

.method protected onPause()V
    .locals 3

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "onPause"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-super {p0}, Landroid/app/Activity;->onPause()V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->j:Lcom/astrob/navi/astrobnavilib/h;

    if-eqz v0, :cond_0

    iget-object v1, v0, Lcom/astrob/navi/astrobnavilib/h;->a:Ljava/lang/String;

    const-string v2, "Pause"

    invoke-static {v1, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v1, 0x1

    iput-boolean v1, v0, Lcom/astrob/navi/astrobnavilib/h;->c:Z

    :cond_0
    return-void
.end method

.method public onRequestPermissionsResult(I[Ljava/lang/String;[I)V
    .locals 2

    sget p2, Lcom/astrob/navi/astrobnavilib/e;->i:I

    if-ne p1, p2, :cond_3

    array-length p1, p3

    const/4 p2, 0x0

    :goto_0
    if-ge p2, p1, :cond_1

    aget v0, p3, p2

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Lcom/astrob/navi/astrobnavilib/e;->g()V

    return-void

    :cond_0
    add-int/lit8 p2, p2, 0x1

    goto :goto_0

    :cond_1
    array-length p1, p3

    if-nez p1, :cond_2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object p1

    iget-object p1, p1, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    sget p2, Lcom/astrob/navi/astrobnavilib/e;->i:I

    invoke-virtual {p1, p0, p2}, Lcom/astrob/navi/astrobnavilib/j;->checkPermission(Landroid/content/Context;I)Z

    return-void

    :cond_2
    iget-object p1, p0, Lcom/astrob/navi/astrobnavilib/e;->o:Landroid/os/Handler;

    new-instance p2, Lcom/astrob/navi/astrobnavilib/e$1;

    invoke-direct {p2, p0}, Lcom/astrob/navi/astrobnavilib/e$1;-><init>(Lcom/astrob/navi/astrobnavilib/e;)V

    const-wide/16 v0, 0x1f4

    invoke-virtual {p1, p2, v0, v1}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    :cond_3
    return-void
.end method

.method protected onResume()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "onResume"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-super {p0}, Landroid/app/Activity;->onResume()V

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->j:Lcom/astrob/navi/astrobnavilib/h;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/h;->a()V

    :cond_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->onResume()V

    return-void
.end method

.method protected onStop()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/e;->h:Ljava/lang/String;

    const-string v1, "onStop"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-super {p0}, Landroid/app/Activity;->onStop()V

    return-void
.end method
