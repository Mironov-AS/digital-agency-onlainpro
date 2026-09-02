.class final Lcom/astrob/navi/astrobnavilib/c$a;
.super Ljava/lang/Thread;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/c;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = "a"
.end annotation


# instance fields
.field a:Landroid/os/Looper;


# direct methods
.method private constructor <init>()V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Thread;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/c$a;->a:Landroid/os/Looper;

    return-void
.end method

.method synthetic constructor <init>(B)V
    .locals 0

    invoke-direct {p0}, Lcom/astrob/navi/astrobnavilib/c$a;-><init>()V

    return-void
.end method


# virtual methods
.method public final run()V
    .locals 2

    const-string v0, "LocationThread"

    const-string v1, "LocationThread --start--"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Landroid/os/Looper;->prepare()V

    invoke-static {}, Landroid/os/Looper;->myLooper()Landroid/os/Looper;

    move-result-object v0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/c$a;->a:Landroid/os/Looper;

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/c$a;->a:Landroid/os/Looper;

    invoke-static {v0}, Lcom/astrob/navi/astrobnavilib/c;->a(Landroid/os/Looper;)V

    invoke-static {}, Landroid/os/Looper;->loop()V

    const-string v0, "LocationThread"

    const-string v1, "LocationThread --end--"

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method
