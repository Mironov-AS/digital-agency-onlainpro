.class final Lcom/astrob/turbodog/NaviAIDLService$2;
.super Ljava/util/TimerTask;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/turbodog/NaviAIDLService;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Lcom/astrob/turbodog/NaviAIDLService;


# direct methods
.method constructor <init>(Lcom/astrob/turbodog/NaviAIDLService;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService$2;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-direct {p0}, Ljava/util/TimerTask;-><init>()V

    return-void
.end method


# virtual methods
.method public final run()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$2;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0}, Lcom/astrob/turbodog/NaviAIDLService;->a(Lcom/astrob/turbodog/NaviAIDLService;)I

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$2;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0}, Lcom/astrob/turbodog/NaviAIDLService;->b(Lcom/astrob/turbodog/NaviAIDLService;)I

    move-result v0

    const/16 v1, 0xa

    if-lt v0, v1, :cond_0

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$2;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0}, Lcom/astrob/turbodog/NaviAIDLService;->c(Lcom/astrob/turbodog/NaviAIDLService;)Ljava/util/Timer;

    move-result-object v0

    invoke-virtual {v0}, Ljava/util/Timer;->cancel()V

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$2;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0}, Lcom/astrob/turbodog/NaviAIDLService;->d(Lcom/astrob/turbodog/NaviAIDLService;)Ljava/util/Timer;

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$2;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0}, Lcom/astrob/turbodog/NaviAIDLService;->e(Lcom/astrob/turbodog/NaviAIDLService;)I

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$2;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0}, Lcom/astrob/turbodog/NaviAIDLService;->f(Lcom/astrob/turbodog/NaviAIDLService;)Z

    :cond_0
    return-void
.end method
