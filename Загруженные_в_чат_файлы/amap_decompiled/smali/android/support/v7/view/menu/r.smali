.class public final Landroid/support/v7/view/menu/r;
.super Landroid/support/v7/view/menu/g;

# interfaces
.implements Landroid/view/SubMenu;


# instance fields
.field public j:Landroid/support/v7/view/menu/g;

.field private k:Landroid/support/v7/view/menu/h;


# direct methods
.method public constructor <init>(Landroid/content/Context;Landroid/support/v7/view/menu/g;Landroid/support/v7/view/menu/h;)V
    .locals 0

    invoke-direct {p0, p1}, Landroid/support/v7/view/menu/g;-><init>(Landroid/content/Context;)V

    iput-object p2, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    iput-object p3, p0, Landroid/support/v7/view/menu/r;->k:Landroid/support/v7/view/menu/h;

    return-void
.end method


# virtual methods
.method public final a(Landroid/support/v7/view/menu/g$a;)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0, p1}, Landroid/support/v7/view/menu/g;->a(Landroid/support/v7/view/menu/g$a;)V

    return-void
.end method

.method public final a()Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0}, Landroid/support/v7/view/menu/g;->a()Z

    move-result v0

    return v0
.end method

.method final a(Landroid/support/v7/view/menu/g;Landroid/view/MenuItem;)Z
    .locals 1

    invoke-super {p0, p1, p2}, Landroid/support/v7/view/menu/g;->a(Landroid/support/v7/view/menu/g;Landroid/view/MenuItem;)Z

    move-result v0

    if-nez v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0, p1, p2}, Landroid/support/v7/view/menu/g;->a(Landroid/support/v7/view/menu/g;Landroid/view/MenuItem;)Z

    move-result p1

    if-eqz p1, :cond_0

    goto :goto_0

    :cond_0
    const/4 p1, 0x0

    return p1

    :cond_1
    :goto_0
    const/4 p1, 0x1

    return p1
.end method

.method public final a(Landroid/support/v7/view/menu/h;)Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0, p1}, Landroid/support/v7/view/menu/g;->a(Landroid/support/v7/view/menu/h;)Z

    move-result p1

    return p1
.end method

.method public final b()Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0}, Landroid/support/v7/view/menu/g;->b()Z

    move-result v0

    return v0
.end method

.method public final b(Landroid/support/v7/view/menu/h;)Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0, p1}, Landroid/support/v7/view/menu/g;->b(Landroid/support/v7/view/menu/h;)Z

    move-result p1

    return p1
.end method

.method public final c()Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0}, Landroid/support/v7/view/menu/g;->c()Z

    move-result v0

    return v0
.end method

.method public final getItem()Landroid/view/MenuItem;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->k:Landroid/support/v7/view/menu/h;

    return-object v0
.end method

.method public final k()Landroid/support/v7/view/menu/g;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0}, Landroid/support/v7/view/menu/g;->k()Landroid/support/v7/view/menu/g;

    move-result-object v0

    return-object v0
.end method

.method public final setGroupDividerEnabled(Z)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0, p1}, Landroid/support/v7/view/menu/g;->setGroupDividerEnabled(Z)V

    return-void
.end method

.method public final setHeaderIcon(I)Landroid/view/SubMenu;
    .locals 6

    const/4 v1, 0x0

    const/4 v2, 0x0

    const/4 v4, 0x0

    const/4 v5, 0x0

    move-object v0, p0

    move v3, p1

    invoke-super/range {v0 .. v5}, Landroid/support/v7/view/menu/g;->a(ILjava/lang/CharSequence;ILandroid/graphics/drawable/Drawable;Landroid/view/View;)V

    move-object p1, p0

    check-cast p1, Landroid/view/SubMenu;

    return-object p1
.end method

.method public final setHeaderIcon(Landroid/graphics/drawable/Drawable;)Landroid/view/SubMenu;
    .locals 6

    const/4 v1, 0x0

    const/4 v2, 0x0

    const/4 v3, 0x0

    const/4 v5, 0x0

    move-object v0, p0

    move-object v4, p1

    invoke-super/range {v0 .. v5}, Landroid/support/v7/view/menu/g;->a(ILjava/lang/CharSequence;ILandroid/graphics/drawable/Drawable;Landroid/view/View;)V

    move-object p1, p0

    check-cast p1, Landroid/view/SubMenu;

    return-object p1
.end method

.method public final setHeaderTitle(I)Landroid/view/SubMenu;
    .locals 6

    const/4 v2, 0x0

    const/4 v3, 0x0

    const/4 v4, 0x0

    const/4 v5, 0x0

    move-object v0, p0

    move v1, p1

    invoke-super/range {v0 .. v5}, Landroid/support/v7/view/menu/g;->a(ILjava/lang/CharSequence;ILandroid/graphics/drawable/Drawable;Landroid/view/View;)V

    move-object p1, p0

    check-cast p1, Landroid/view/SubMenu;

    return-object p1
.end method

.method public final setHeaderTitle(Ljava/lang/CharSequence;)Landroid/view/SubMenu;
    .locals 6

    const/4 v1, 0x0

    const/4 v3, 0x0

    const/4 v4, 0x0

    const/4 v5, 0x0

    move-object v0, p0

    move-object v2, p1

    invoke-super/range {v0 .. v5}, Landroid/support/v7/view/menu/g;->a(ILjava/lang/CharSequence;ILandroid/graphics/drawable/Drawable;Landroid/view/View;)V

    move-object p1, p0

    check-cast p1, Landroid/view/SubMenu;

    return-object p1
.end method

.method public final setHeaderView(Landroid/view/View;)Landroid/view/SubMenu;
    .locals 6

    const/4 v1, 0x0

    const/4 v2, 0x0

    const/4 v3, 0x0

    const/4 v4, 0x0

    move-object v0, p0

    move-object v5, p1

    invoke-super/range {v0 .. v5}, Landroid/support/v7/view/menu/g;->a(ILjava/lang/CharSequence;ILandroid/graphics/drawable/Drawable;Landroid/view/View;)V

    move-object p1, p0

    check-cast p1, Landroid/view/SubMenu;

    return-object p1
.end method

.method public final setIcon(I)Landroid/view/SubMenu;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->k:Landroid/support/v7/view/menu/h;

    invoke-virtual {v0, p1}, Landroid/support/v7/view/menu/h;->setIcon(I)Landroid/view/MenuItem;

    return-object p0
.end method

.method public final setIcon(Landroid/graphics/drawable/Drawable;)Landroid/view/SubMenu;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->k:Landroid/support/v7/view/menu/h;

    invoke-virtual {v0, p1}, Landroid/support/v7/view/menu/h;->setIcon(Landroid/graphics/drawable/Drawable;)Landroid/view/MenuItem;

    return-object p0
.end method

.method public final setQwertyMode(Z)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->j:Landroid/support/v7/view/menu/g;

    invoke-virtual {v0, p1}, Landroid/support/v7/view/menu/g;->setQwertyMode(Z)V

    return-void
.end method
