.class public Lcom/astrob/turbodog/c;
.super Ljava/lang/Object;


# static fields
.field private static b:Lcom/astrob/turbodog/c;


# instance fields
.field a:Ljava/util/Vector;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Vector<",
            "Lcom/astrob/turbodog/b;",
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

    iput-object v0, p0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    const-string v0, "NaviDispatchSubject"

    const-string v1, "NaviProtocolSubject"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    return-void
.end method

.method public static a()Lcom/astrob/turbodog/c;
    .locals 2

    sget-object v0, Lcom/astrob/turbodog/c;->b:Lcom/astrob/turbodog/c;

    if-nez v0, :cond_1

    const-class v0, Lcom/astrob/turbodog/c;

    monitor-enter v0

    :try_start_0
    sget-object v1, Lcom/astrob/turbodog/c;->b:Lcom/astrob/turbodog/c;

    if-nez v1, :cond_0

    new-instance v1, Lcom/astrob/turbodog/c;

    invoke-direct {v1}, Lcom/astrob/turbodog/c;-><init>()V

    sput-object v1, Lcom/astrob/turbodog/c;->b:Lcom/astrob/turbodog/c;

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
    sget-object v0, Lcom/astrob/turbodog/c;->b:Lcom/astrob/turbodog/c;

    return-object v0
.end method


# virtual methods
.method final a(IIIILjava/lang/String;II)V
    .locals 11

    move-object v0, p0

    iget-object v1, v0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v1}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v1

    :goto_0
    invoke-interface {v1}, Ljava/util/Iterator;->hasNext()Z

    move-result v2

    if-eqz v2, :cond_0

    invoke-interface {v1}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v2

    move-object v3, v2

    check-cast v3, Lcom/astrob/turbodog/b;

    move v4, p1

    move v5, p2

    move v6, p3

    move v7, p4

    move-object/from16 v8, p5

    move/from16 v9, p6

    move/from16 v10, p7

    invoke-interface/range {v3 .. v10}, Lcom/astrob/turbodog/b;->a(IIIILjava/lang/String;II)V

    goto :goto_0

    :cond_0
    return-void
.end method

.method final a(ZZ)V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/b;

    invoke-interface {v1, p1, p2}, Lcom/astrob/turbodog/b;->a(ZZ)V

    goto :goto_0

    :cond_0
    return-void
.end method

.method final a(Lcom/astrob/turbodog/b;)Z
    .locals 1

    iget-object v0, p0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->size()I

    move-result v0

    if-nez v0, :cond_0

    const/4 p1, 0x0

    return p1

    :cond_0
    iget-object v0, p0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0, p1}, Ljava/util/Vector;->contains(Ljava/lang/Object;)Z

    move-result p1

    return p1
.end method

.method final b()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/b;

    invoke-interface {v1}, Lcom/astrob/turbodog/b;->f()V

    goto :goto_0

    :cond_0
    return-void
.end method

.method final c()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/b;

    invoke-interface {v1}, Lcom/astrob/turbodog/b;->g()V

    goto :goto_0

    :cond_0
    return-void
.end method

.method final d()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/turbodog/c;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/turbodog/b;

    invoke-interface {v1}, Lcom/astrob/turbodog/b;->h()V

    goto :goto_0

    :cond_0
    return-void
.end method
