.class final Lcom/astrob/turbodog/NaviAIDLService$1;
.super Lcom/astrob/turbodog/a/a$a;


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

    iput-object p1, p0, Lcom/astrob/turbodog/NaviAIDLService$1;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-direct {p0}, Lcom/astrob/turbodog/a/a$a;-><init>()V

    return-void
.end method


# virtual methods
.method public final a(Lcom/astrob/turbodog/a/b;)V
    .locals 1

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$1;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->a(Lcom/astrob/turbodog/NaviAIDLService;Lcom/astrob/turbodog/a/b;)Lcom/astrob/turbodog/a/b;

    return-void
.end method

.method public final a(Ljava/lang/String;)V
    .locals 3

    const-string v0, "NaviAIDLService"

    const-string v1, "request string:"

    invoke-static {p1}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    iget-object v0, p0, Lcom/astrob/turbodog/NaviAIDLService$1;->a:Lcom/astrob/turbodog/NaviAIDLService;

    invoke-static {v0, p1}, Lcom/astrob/turbodog/NaviAIDLService;->a(Lcom/astrob/turbodog/NaviAIDLService;Ljava/lang/String;)V

    return-void
.end method
