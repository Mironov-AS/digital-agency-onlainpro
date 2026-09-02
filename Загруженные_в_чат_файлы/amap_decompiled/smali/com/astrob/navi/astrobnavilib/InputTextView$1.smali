.class final Lcom/astrob/navi/astrobnavilib/InputTextView$1;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/text/TextWatcher;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/InputTextView;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Lcom/astrob/navi/astrobnavilib/InputTextView;


# direct methods
.method constructor <init>(Lcom/astrob/navi/astrobnavilib/InputTextView;)V
    .locals 0

    iput-object p1, p0, Lcom/astrob/navi/astrobnavilib/InputTextView$1;->a:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final afterTextChanged(Landroid/text/Editable;)V
    .locals 0

    return-void
.end method

.method public final beforeTextChanged(Ljava/lang/CharSequence;III)V
    .locals 0

    iget-object p2, p0, Lcom/astrob/navi/astrobnavilib/InputTextView$1;->a:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-virtual {p2}, Lcom/astrob/navi/astrobnavilib/InputTextView;->isFocused()Z

    move-result p2

    if-nez p2, :cond_0

    return-void

    :cond_0
    iget-object p2, p0, Lcom/astrob/navi/astrobnavilib/InputTextView$1;->a:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-interface {p1}, Ljava/lang/CharSequence;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {p2, p1}, Lcom/astrob/navi/astrobnavilib/InputTextView;->a(Lcom/astrob/navi/astrobnavilib/InputTextView;Ljava/lang/String;)Ljava/lang/String;

    return-void
.end method

.method public final onTextChanged(Ljava/lang/CharSequence;III)V
    .locals 2

    iget-object v0, p0, Lcom/astrob/navi/astrobnavilib/InputTextView$1;->a:Lcom/astrob/navi/astrobnavilib/InputTextView;

    invoke-virtual {v0}, Lcom/astrob/navi/astrobnavilib/InputTextView;->isFocused()Z

    move-result v0

    if-nez v0, :cond_0

    return-void

    :cond_0
    const/4 v0, 0x1

    if-le p3, p4, :cond_2

    sub-int/2addr p3, p4

    :goto_0
    add-int/lit8 p1, p3, -0x1

    if-lez p3, :cond_1

    const-string p2, ""

    invoke-static {p2, v0, v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->inputKey(Ljava/lang/String;IZ)V

    move p3, p1

    goto :goto_0

    :cond_1
    return-void

    :cond_2
    if-ge p3, p4, :cond_4

    add-int/2addr p3, p2

    add-int/2addr p2, p4

    invoke-interface {p1, p3, p2}, Ljava/lang/CharSequence;->subSequence(II)Ljava/lang/CharSequence;

    move-result-object p1

    const/4 p2, 0x0

    const/4 p3, 0x0

    :goto_1
    invoke-interface {p1}, Ljava/lang/CharSequence;->length()I

    move-result p4

    if-ge p3, p4, :cond_4

    invoke-interface {p1}, Ljava/lang/CharSequence;->length()I

    move-result p4

    sub-int/2addr p4, v0

    if-ne p3, p4, :cond_3

    const/4 p4, 0x1

    goto :goto_2

    :cond_3
    const/4 p4, 0x0

    :goto_2
    add-int/lit8 v1, p3, 0x1

    invoke-interface {p1, p3, v1}, Ljava/lang/CharSequence;->subSequence(II)Ljava/lang/CharSequence;

    move-result-object p3

    invoke-interface {p3}, Ljava/lang/CharSequence;->toString()Ljava/lang/String;

    move-result-object p3

    invoke-static {p3, p2, p4}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->inputKey(Ljava/lang/String;IZ)V

    move p3, v1

    goto :goto_1

    :cond_4
    return-void
.end method
