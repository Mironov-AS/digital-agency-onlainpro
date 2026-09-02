.class public Lcom/astrob/navi/astrobnavilib/f;
.super Landroid/app/Service;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/navi/astrobnavilib/f$a;
    }
.end annotation


# instance fields
.field private a:Lcom/astrob/navi/astrobnavilib/f$a;


# direct methods
.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Landroid/app/Service;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/f;->a:Lcom/astrob/navi/astrobnavilib/f$a;

    return-void
.end method


# virtual methods
.method public onBind(Landroid/content/Intent;)Landroid/os/IBinder;
    .locals 0

    const/4 p1, 0x0

    return-object p1
.end method

.method public onCreate()V
    .locals 3

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/k;->a()Lcom/astrob/navi/astrobnavilib/k;

    move-result-object v0

    iget-object v0, v0, Lcom/astrob/navi/astrobnavilib/k;->a:Lcom/astrob/navi/astrobnavilib/j;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/j;->regeisteProtocal()Landroid/content/IntentFilter;

    move-result-object v0

    if-eqz v0, :cond_0

    new-instance v1, Lcom/astrob/navi/astrobnavilib/f$a;

    const/4 v2, 0x0

    invoke-direct {v1, p0, v2}, Lcom/astrob/navi/astrobnavilib/f$a;-><init>(Lcom/astrob/navi/astrobnavilib/f;B)V

    iput-object v1, p0, Lcom/astrob/navi/astrobnavilib/f;->a:Lcom/astrob/navi/astrobnavilib/f$a;

    iget-object v1, p0, Lcom/astrob/navi/astrobnavilib/f;->a:Lcom/astrob/navi/astrobnavilib/f$a;

    invoke-virtual {p0, v1, v0}, Lcom/astrob/navi/astrobnavilib/f;->registerReceiver(Landroid/content/BroadcastReceiver;Landroid/content/IntentFilter;)Landroid/content/Intent;

    :cond_0
    invoke-super {p0}, Landroid/app/Service;->onCreate()V

    const-string v0, "MQNaviService"

    const-string v1, "onCreate"

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method public onDestroy()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/f;->a:Lcom/astrob/navi/astrobnavilib/f$a;

    if-eqz v0, :cond_0

    invoke-virtual {p0, v0}, Lcom/astrob/navi/astrobnavilib/f;->unregisterReceiver(Landroid/content/BroadcastReceiver;)V

    :cond_0
    invoke-super {p0}, Landroid/app/Service;->onDestroy()V

    const-string v0, "MQNaviService"

    const-string v1, "onDestroy"

    invoke-static {v0, v1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method public onStartCommand(Landroid/content/Intent;II)I
    .locals 0

    const-string p1, "MQNaviService"

    const-string p2, "onStartCommand"

    invoke-static {p1, p2}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    const/4 p1, 0x2

    return p1
.end method
