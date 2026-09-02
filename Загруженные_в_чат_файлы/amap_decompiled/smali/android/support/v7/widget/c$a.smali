.class final Landroid/support/v7/widget/c$a;
.super Landroid/support/v7/view/menu/l;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/widget/c;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = "a"
.end annotation


# instance fields
.field final synthetic d:Landroid/support/v7/widget/c;


# direct methods
.method public constructor <init>(Landroid/support/v7/widget/c;Landroid/content/Context;Landroid/support/v7/view/menu/r;Landroid/view/View;)V
    .locals 6

    iput-object p1, p0, Landroid/support/v7/widget/c$a;->d:Landroid/support/v7/widget/c;

    sget v5, Landroid/support/v7/a/a$a;->actionOverflowMenuStyle:I

    const/4 v4, 0x0

    move-object v0, p0

    move-object v1, p2

    move-object v2, p3

    move-object v3, p4

    invoke-direct/range {v0 .. v5}, Landroid/support/v7/view/menu/l;-><init>(Landroid/content/Context;Landroid/support/v7/view/menu/g;Landroid/view/View;ZI)V

    invoke-virtual {p3}, Landroid/support/v7/view/menu/r;->getItem()Landroid/view/MenuItem;

    move-result-object p2

    check-cast p2, Landroid/support/v7/view/menu/h;

    invoke-virtual {p2}, Landroid/support/v7/view/menu/h;->f()Z

    move-result p2

    if-nez p2, :cond_1

    iget-object p2, p1, Landroid/support/v7/widget/c;->h:Landroid/support/v7/widget/c$d;

    if-nez p2, :cond_0

    iget-object p2, p1, Landroid/support/v7/widget/c;->g:Landroid/support/v7/view/menu/n;

    check-cast p2, Landroid/view/View;

    goto :goto_0

    :cond_0
    iget-object p2, p1, Landroid/support/v7/widget/c;->h:Landroid/support/v7/widget/c$d;

    :goto_0
    iput-object p2, p0, Landroid/support/v7/view/menu/l;->a:Landroid/view/View;

    :cond_1
    iget-object p1, p1, Landroid/support/v7/widget/c;->q:Landroid/support/v7/widget/c$f;

    invoke-virtual {p0, p1}, Landroid/support/v7/widget/c$a;->a(Landroid/support/v7/view/menu/m$a;)V

    return-void
.end method


# virtual methods
.method public final d()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/widget/c$a;->d:Landroid/support/v7/widget/c;

    const/4 v1, 0x0

    iput-object v1, v0, Landroid/support/v7/widget/c;->o:Landroid/support/v7/widget/c$a;

    const/4 v1, 0x0

    iput v1, v0, Landroid/support/v7/widget/c;->r:I

    invoke-super {p0}, Landroid/support/v7/view/menu/l;->d()V

    return-void
.end method
