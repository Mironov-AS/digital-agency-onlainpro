.class public Lcom/astrob/turbodog/e;
.super Ljava/lang/Object;


# static fields
.field private static b:Lcom/astrob/turbodog/e;


# instance fields
.field a:Ljava/util/Vector;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Vector<",
            "Lcom/astrob/turbodog/d;",
            ">;"
        }
    .end annotation
.end field


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method private constructor <init>()V
    .locals 2

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/util/Vector;

    invoke-direct {v0}, Ljava/util/Vector;-><init>()V

    iput-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    const-string v0, "NaviProtocolSubject"

    const-string v1, "NaviProtocolSubject"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method public static a()Lcom/astrob/turbodog/e;
    .locals 2

    sget-object v0, Lcom/astrob/turbodog/e;->b:Lcom/astrob/turbodog/e;

    if-nez v0, :cond_1

    const-class v0, Lcom/astrob/turbodog/e;

    monitor-enter v0

    :try_start_0
    sget-object v1, Lcom/astrob/turbodog/e;->b:Lcom/astrob/turbodog/e;

    if-nez v1, :cond_0

    new-instance v1, Lcom/astrob/turbodog/e;

    invoke-direct {v1}, Lcom/astrob/turbodog/e;-><init>()V

    sput-object v1, Lcom/astrob/turbodog/e;->b:Lcom/astrob/turbodog/e;

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
    sget-object v0, Lcom/astrob/turbodog/e;->b:Lcom/astrob/turbodog/e;

    return-object v0
.end method


# virtual methods
.method public final a(II)V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/d;

    invoke-interface {v1, p1, p2}, Lcom/astrob/turbodog/d;->a(II)V

    goto :goto_0

    :cond_0
    return-void
.end method

.method public final a(IILjava/util/List;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(II",
            "Ljava/util/List<",
            "Lcom/astrob/navi/astrobnavilib/PoiResultInfoBean;",
            ">;)V"
        }
    .end annotation

    iget-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/d;

    invoke-interface {v1, p1, p2, p3}, Lcom/astrob/turbodog/d;->a(IILjava/util/List;)V

    goto :goto_0

    :cond_0
    return-void
.end method

.method public final a(ILjava/lang/String;)V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/d;

    invoke-interface {v1, p1, p2}, Lcom/astrob/turbodog/d;->a(ILjava/lang/String;)V

    goto :goto_0

    :cond_0
    return-void
.end method

.method public final a(ILjava/util/List;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(I",
            "Ljava/util/List<",
            "Lcom/astrob/turbodog/f;",
            ">;)V"
        }
    .end annotation

    iget-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/d;

    invoke-interface {v1, p1, p2}, Lcom/astrob/turbodog/d;->a(ILjava/util/List;)V

    goto :goto_0

    :cond_0
    return-void
.end method

.method final a(Lcom/astrob/turbodog/d;)Z
    .locals 1

    iget-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->size()I

    move-result v0

    if-nez v0, :cond_0

    const/4 p1, 0x0

    return p1

    :cond_0
    iget-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0, p1}, Ljava/util/Vector;->contains(Ljava/lang/Object;)Z

    move-result p1

    return p1
.end method

.method public final b(II)V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/e;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/d;

    invoke-interface {v1, p1, p2}, Lcom/astrob/turbodog/d;->b(II)V

    goto :goto_0

    :cond_0
    return-void
.end method
