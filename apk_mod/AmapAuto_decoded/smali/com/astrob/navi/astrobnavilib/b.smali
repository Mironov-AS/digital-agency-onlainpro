.class public final Lcom/astrob/navi/astrobnavilib/b;
.super Ljava/lang/Object;


# static fields
.field private static b:Lcom/astrob/navi/astrobnavilib/b;


# instance fields
.field a:Ljava/util/Vector;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Vector<",
            "Lcom/astrob/navi/astrobnavilib/a;",
            ">;"
        }
    .end annotation
.end field


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/util/Vector;

    invoke-direct {v0}, Ljava/util/Vector;-><init>()V

    iput-object v0, p0, Lcom/astrob/navi/astrobnavilib/b;->a:Ljava/util/Vector;

    return-void
.end method

.method public static a()Lcom/astrob/navi/astrobnavilib/b;
    .locals 1

    sget-object v0, Lcom/astrob/navi/astrobnavilib/b;->b:Lcom/astrob/navi/astrobnavilib/b;

    if-nez v0, :cond_0

    new-instance v0, Lcom/astrob/navi/astrobnavilib/b;

    invoke-direct {v0}, Lcom/astrob/navi/astrobnavilib/b;-><init>()V

    sput-object v0, Lcom/astrob/navi/astrobnavilib/b;->b:Lcom/astrob/navi/astrobnavilib/b;

    :cond_0
    sget-object v0, Lcom/astrob/navi/astrobnavilib/b;->b:Lcom/astrob/navi/astrobnavilib/b;

    return-object v0
.end method


# virtual methods
.method public final a(Lcom/astrob/navi/astrobnavilib/a;)V
    .locals 1

    invoke-virtual {p0, p1}, Lcom/astrob/navi/astrobnavilib/b;->b(Lcom/astrob/navi/astrobnavilib/a;)Z

    move-result v0

    if-eqz v0, :cond_0

    return-void

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/b;->a:Ljava/util/Vector;

    invoke-virtual {v0, p1}, Ljava/util/Vector;->add(Ljava/lang/Object;)Z

    return-void
.end method

.method public final b()V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/b;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/astrob/navi/astrobnavilib/a;

    invoke-interface {v1}, Lcom/astrob/navi/astrobnavilib/a;->a()V

    goto :goto_0

    :cond_0
    return-void
.end method

.method final b(Lcom/astrob/navi/astrobnavilib/a;)Z
    .locals 1

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/b;->a:Ljava/util/Vector;

    invoke-virtual {v0}, Ljava/util/Vector;->size()I

    move-result v0

    if-nez v0, :cond_0

    const/4 p1, 0x0

    return p1

    :cond_0
    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/b;->a:Ljava/util/Vector;

    invoke-virtual {v0, p1}, Ljava/util/Vector;->contains(Ljava/lang/Object;)Z

    move-result p1

    return p1
.end method
