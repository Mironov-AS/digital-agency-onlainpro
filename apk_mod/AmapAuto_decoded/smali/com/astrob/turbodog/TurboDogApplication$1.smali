.class final Lcom/astrob/turbodog/TurboDogApplication$1;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/app/Application$ActivityLifecycleCallbacks;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/turbodog/TurboDogApplication;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Lcom/astrob/turbodog/TurboDogApplication;


# direct methods
.method constructor <init>(Lcom/astrob/turbodog/TurboDogApplication;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/turbodog/TurboDogApplication$1;->a:Lcom/astrob/turbodog/TurboDogApplication;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final onActivityCreated(Landroid/app/Activity;Landroid/os/Bundle;)V
    .locals 0

    return-void
.end method

.method public final onActivityDestroyed(Landroid/app/Activity;)V
    .locals 0

    return-void
.end method

.method public final onActivityPaused(Landroid/app/Activity;)V
    .locals 1

    iget-object p1, p0, Lcom/astrob/turbodog/TurboDogApplication$1;->a:Lcom/astrob/turbodog/TurboDogApplication;

    invoke-static {p1}, Lcom/astrob/turbodog/TurboDogApplication;->d(Lcom/astrob/turbodog/TurboDogApplication;)I

    iget-object p1, p0, Lcom/astrob/turbodog/TurboDogApplication$1;->a:Lcom/astrob/turbodog/TurboDogApplication;

    invoke-static {p1}, Lcom/astrob/turbodog/TurboDogApplication;->e(Lcom/astrob/turbodog/TurboDogApplication;)I

    move-result p1

    if-nez p1, :cond_0

    iget-object p1, p0, Lcom/astrob/turbodog/TurboDogApplication$1;->a:Lcom/astrob/turbodog/TurboDogApplication;

    invoke-static {p1}, Lcom/astrob/turbodog/TurboDogApplication;->f(Lcom/astrob/turbodog/TurboDogApplication;)V

    const-string p1, "TurboDogApplication"

    const-string v0, "onActivityPaused leaveApp"

    invoke-static {p1, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    :cond_0
    return-void
.end method

.method public final onActivityResumed(Landroid/app/Activity;)V
    .locals 1

    iget-object p1, p0, Lcom/astrob/turbodog/TurboDogApplication$1;->a:Lcom/astrob/turbodog/TurboDogApplication;

    invoke-static {p1}, Lcom/astrob/turbodog/TurboDogApplication;->a(Lcom/astrob/turbodog/TurboDogApplication;)I

    iget-object p1, p0, Lcom/astrob/turbodog/TurboDogApplication$1;->a:Lcom/astrob/turbodog/TurboDogApplication;

    invoke-static {p1}, Lcom/astrob/turbodog/TurboDogApplication;->b(Lcom/astrob/turbodog/TurboDogApplication;)Z

    move-result p1

    if-eqz p1, :cond_0

    iget-object p1, p0, Lcom/astrob/turbodog/TurboDogApplication$1;->a:Lcom/astrob/turbodog/TurboDogApplication;

    invoke-static {p1}, Lcom/astrob/turbodog/TurboDogApplication;->c(Lcom/astrob/turbodog/TurboDogApplication;)V

    const-string p1, "TurboDogApplication"

    const-string v0, "onActivityResumed back2App"

    invoke-static {p1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    :cond_0
    return-void
.end method

.method public final onActivitySaveInstanceState(Landroid/app/Activity;Landroid/os/Bundle;)V
    .locals 0

    return-void
.end method

.method public final onActivityStarted(Landroid/app/Activity;)V
    .locals 0

    return-void
.end method

.method public final onActivityStopped(Landroid/app/Activity;)V
    .locals 0

    return-void
.end method
