.class final Landroid/support/v7/widget/x$c;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/widget/AbsListView$OnScrollListener;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/widget/x;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = "c"
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/widget/x;


# direct methods
.method constructor <init>(Landroid/support/v7/widget/x;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/x$c;->a:Landroid/support/v7/widget/x;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final onScroll(Landroid/widget/AbsListView;III)V
    .locals 0

    return-void
.end method

.method public final onScrollStateChanged(Landroid/widget/AbsListView;I)V
    .locals 0

    const/4 p1, 0x1

    if-ne p2, p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/widget/x$c;->a:Landroid/support/v7/widget/x;

    invoke-virtual {p1}, Landroid/support/v7/widget/x;->j()Z

    move-result p1

    if-nez p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/widget/x$c;->a:Landroid/support/v7/widget/x;

    iget-object p1, p1, Landroid/support/v7/widget/x;->q:Landroid/widget/PopupWindow;

    invoke-virtual {p1}, Landroid/widget/PopupWindow;->getContentView()Landroid/view/View;

    move-result-object p1

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/widget/x$c;->a:Landroid/support/v7/widget/x;

    iget-object p1, p1, Landroid/support/v7/widget/x;->n:Landroid/os/Handler;

    iget-object p2, p0, Landroid/support/v7/widget/x$c;->a:Landroid/support/v7/widget/x;

    iget-object p2, p2, Landroid/support/v7/widget/x;->m:Landroid/support/v7/widget/x$e;

    invoke-virtual {p1, p2}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V

    iget-object p1, p0, Landroid/support/v7/widget/x$c;->a:Landroid/support/v7/widget/x;

    iget-object p1, p1, Landroid/support/v7/widget/x;->m:Landroid/support/v7/widget/x$e;

    invoke-virtual {p1}, Landroid/support/v7/widget/x$e;->run()V

    :cond_0
    return-void
.end method
