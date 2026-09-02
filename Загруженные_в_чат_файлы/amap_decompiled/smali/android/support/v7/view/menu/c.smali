.class abstract Landroid/support/v7/view/menu/c;
.super Landroid/support/v7/view/menu/d;


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "<T:",
        "Ljava/lang/Object;",
        ">",
        "Landroid/support/v7/view/menu/d<",
        "TT;>;"
    }
.end annotation


# instance fields
.field final a:Landroid/content/Context;

.field b:Ljava/util/Map;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Map<",
            "Landroid/support/v4/b/a/b;",
            "Landroid/view/MenuItem;",
            ">;"
        }
    .end annotation
.end field

.field c:Ljava/util/Map;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Map<",
            "Landroid/support/v4/b/a/c;",
            "Landroid/view/SubMenu;",
            ">;"
        }
    .end annotation
.end field


# direct methods
.method constructor <init>(Landroid/content/Context;Ljava/lang/Object;)V
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Context;",
            "TT;)V"
        }
    .end annotation

    invoke-direct {p0, p2}, Landroid/support/v7/view/menu/d;-><init>(Ljava/lang/Object;)V

    iput-object p1, p0, Landroid/support/v7/view/menu/c;->a:Landroid/content/Context;

    return-void
.end method


# virtual methods
.method final a(Landroid/view/MenuItem;)Landroid/view/MenuItem;
    .locals 3

    instance-of v0, p1, Landroid/support/v4/b/a/b;

    if-eqz v0, :cond_2

    move-object v0, p1

    check-cast v0, Landroid/support/v4/b/a/b;

    iget-object v1, p0, Landroid/support/v7/view/menu/c;->b:Ljava/util/Map;

    if-nez v1, :cond_0

    new-instance v1, Landroid/support/v4/e/a;

    invoke-direct {v1}, Landroid/support/v4/e/a;-><init>()V

    iput-object v1, p0, Landroid/support/v7/view/menu/c;->b:Ljava/util/Map;

    :cond_0
    iget-object v1, p0, Landroid/support/v7/view/menu/c;->b:Ljava/util/Map;

    invoke-interface {v1, p1}, Ljava/util/Map;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object p1

    check-cast p1, Landroid/view/MenuItem;

    if-nez p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/view/menu/c;->a:Landroid/content/Context;

    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x10

    if-lt v1, v2, :cond_1

    new-instance v1, Landroid/support/v7/view/menu/j;

    invoke-direct {v1, p1, v0}, Landroid/support/v7/view/menu/j;-><init>(Landroid/content/Context;Landroid/support/v4/b/a/b;)V

    goto :goto_0

    :cond_1
    new-instance v1, Landroid/support/v7/view/menu/i;

    invoke-direct {v1, p1, v0}, Landroid/support/v7/view/menu/i;-><init>(Landroid/content/Context;Landroid/support/v4/b/a/b;)V

    :goto_0
    move-object p1, v1

    iget-object v1, p0, Landroid/support/v7/view/menu/c;->b:Ljava/util/Map;

    invoke-interface {v1, v0, p1}, Ljava/util/Map;->put(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    :cond_2
    return-object p1
.end method

.method final a(Landroid/view/SubMenu;)Landroid/view/SubMenu;
    .locals 2

    instance-of v0, p1, Landroid/support/v4/b/a/c;

    if-eqz v0, :cond_2

    check-cast p1, Landroid/support/v4/b/a/c;

    iget-object v0, p0, Landroid/support/v7/view/menu/c;->c:Ljava/util/Map;

    if-nez v0, :cond_0

    new-instance v0, Landroid/support/v4/e/a;

    invoke-direct {v0}, Landroid/support/v4/e/a;-><init>()V

    iput-object v0, p0, Landroid/support/v7/view/menu/c;->c:Ljava/util/Map;

    :cond_0
    iget-object v0, p0, Landroid/support/v7/view/menu/c;->c:Ljava/util/Map;

    invoke-interface {v0, p1}, Ljava/util/Map;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/view/SubMenu;

    if-nez v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/view/menu/c;->a:Landroid/content/Context;

    new-instance v1, Landroid/support/v7/view/menu/s;

    invoke-direct {v1, v0, p1}, Landroid/support/v7/view/menu/s;-><init>(Landroid/content/Context;Landroid/support/v4/b/a/c;)V

    iget-object v0, p0, Landroid/support/v7/view/menu/c;->c:Ljava/util/Map;

    invoke-interface {v0, p1, v1}, Ljava/util/Map;->put(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    move-object v0, v1

    :cond_1
    return-object v0

    :cond_2
    return-object p1
.end method
