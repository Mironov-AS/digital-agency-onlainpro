.class public final Landroid/support/v4/a/a/f;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/support/v4/a/a/f$a;
    }
.end annotation


# direct methods
.method public static a(Landroid/content/Context;ILandroid/util/TypedValue;ILandroid/support/v4/a/a/f$a;)Landroid/graphics/Typeface;
    .locals 6

    invoke-virtual {p0}, Landroid/content/Context;->isRestricted()Z

    move-result v0

    if-eqz v0, :cond_0

    const/4 p0, 0x0

    return-object p0

    :cond_0
    invoke-virtual {p0}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v1

    const/4 v0, 0x1

    invoke-virtual {v1, p1, p2, v0}, Landroid/content/res/Resources;->getValue(ILandroid/util/TypedValue;Z)V

    move-object v0, p0

    move-object v2, p2

    move v3, p1

    move v4, p3

    move-object v5, p4

    invoke-static/range {v0 .. v5}, Landroid/support/v4/a/a/f;->a(Landroid/content/Context;Landroid/content/res/Resources;Landroid/util/TypedValue;IILandroid/support/v4/a/a/f$a;)Landroid/graphics/Typeface;

    move-result-object p0

    if-nez p0, :cond_2

    if-eqz p4, :cond_1

    goto :goto_0

    :cond_1
    new-instance p0, Landroid/content/res/Resources$NotFoundException;

    new-instance p2, Ljava/lang/StringBuilder;

    const-string p3, "Font resource ID #0x"

    invoke-direct {p2, p3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-static {p1}, Ljava/lang/Integer;->toHexString(I)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, " could not be retrieved."

    invoke-virtual {p2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-direct {p0, p1}, Landroid/content/res/Resources$NotFoundException;-><init>(Ljava/lang/String;)V

    throw p0

    :cond_2
    :goto_0
    return-object p0
.end method

.method private static a(Landroid/content/Context;Landroid/content/res/Resources;Landroid/util/TypedValue;IILandroid/support/v4/a/a/f$a;)Landroid/graphics/Typeface;
    .locals 9

    iget-object v0, p2, Landroid/util/TypedValue;->string:Ljava/lang/CharSequence;

    if-eqz v0, :cond_a

    iget-object p2, p2, Landroid/util/TypedValue;->string:Ljava/lang/CharSequence;

    invoke-interface {p2}, Ljava/lang/CharSequence;->toString()Ljava/lang/String;

    move-result-object p2

    const-string v0, "res/"

    invoke-virtual {p2, v0}, Ljava/lang/String;->startsWith(Ljava/lang/String;)Z

    move-result v0

    const/4 v1, -0x3

    const/4 v2, 0x0

    if-nez v0, :cond_1

    if-eqz p5, :cond_0

    invoke-virtual {p5, v1, v2}, Landroid/support/v4/a/a/f$a;->a(ILandroid/os/Handler;)V

    :cond_0
    return-object v2

    :cond_1
    invoke-static {p1, p3, p4}, Landroid/support/v4/graphics/c;->a(Landroid/content/res/Resources;II)Landroid/graphics/Typeface;

    move-result-object v0

    if-eqz v0, :cond_3

    if-eqz p5, :cond_2

    invoke-virtual {p5, v0, v2}, Landroid/support/v4/a/a/f$a;->a(Landroid/graphics/Typeface;Landroid/os/Handler;)V

    :cond_2
    return-object v0

    :cond_3
    :try_start_0
    invoke-virtual {p2}, Ljava/lang/String;->toLowerCase()Ljava/lang/String;

    move-result-object v0

    const-string v3, ".xml"

    invoke-virtual {v0, v3}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_6

    invoke-virtual {p1, p3}, Landroid/content/res/Resources;->getXml(I)Landroid/content/res/XmlResourceParser;

    move-result-object v0

    invoke-static {v0, p1}, Landroid/support/v4/a/a/c;->a(Lorg/xmlpull/v1/XmlPullParser;Landroid/content/res/Resources;)Landroid/support/v4/a/a/c$a;

    move-result-object v4

    if-nez v4, :cond_5

    const-string p0, "ResourcesCompat"

    const-string p1, "Failed to find font-family tag"

    invoke-static {p0, p1}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I

    if-eqz p5, :cond_4

    invoke-virtual {p5, v1, v2}, Landroid/support/v4/a/a/f$a;->a(ILandroid/os/Handler;)V

    :cond_4
    return-object v2

    :cond_5
    move-object v3, p0

    move-object v5, p1

    move v6, p3

    move v7, p4

    move-object v8, p5

    invoke-static/range {v3 .. v8}, Landroid/support/v4/graphics/c;->a(Landroid/content/Context;Landroid/support/v4/a/a/c$a;Landroid/content/res/Resources;IILandroid/support/v4/a/a/f$a;)Landroid/graphics/Typeface;

    move-result-object p0

    return-object p0

    :cond_6
    invoke-static {p0, p1, p3, p2, p4}, Landroid/support/v4/graphics/c;->a(Landroid/content/Context;Landroid/content/res/Resources;ILjava/lang/String;I)Landroid/graphics/Typeface;

    move-result-object p0

    if-eqz p5, :cond_8

    if-eqz p0, :cond_7

    invoke-virtual {p5, p0, v2}, Landroid/support/v4/a/a/f$a;->a(Landroid/graphics/Typeface;Landroid/os/Handler;)V

    goto :goto_0

    :cond_7
    invoke-virtual {p5, v1, v2}, Landroid/support/v4/a/a/f$a;->a(ILandroid/os/Handler;)V
    :try_end_0
    .catch Lorg/xmlpull/v1/XmlPullParserException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/io/IOException; {:try_start_0 .. :try_end_0} :catch_0

    :cond_8
    :goto_0
    return-object p0

    :catch_0
    move-exception p0

    const-string p1, "ResourcesCompat"

    const-string p3, "Failed to read xml resource "

    goto :goto_1

    :catch_1
    move-exception p0

    const-string p1, "ResourcesCompat"

    const-string p3, "Failed to parse xml resource "

    :goto_1
    invoke-static {p2}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p2

    invoke-virtual {p3, p2}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p2

    invoke-static {p1, p2, p0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)I

    if-eqz p5, :cond_9

    invoke-virtual {p5, v1, v2}, Landroid/support/v4/a/a/f$a;->a(ILandroid/os/Handler;)V

    :cond_9
    return-object v2

    :cond_a
    new-instance p0, Landroid/content/res/Resources$NotFoundException;

    new-instance p4, Ljava/lang/StringBuilder;

    const-string p5, "Resource \""

    invoke-direct {p4, p5}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p1, p3}, Landroid/content/res/Resources;->getResourceName(I)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p4, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, "\" ("

    invoke-virtual {p4, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-static {p3}, Ljava/lang/Integer;->toHexString(I)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p4, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string p1, ") is not a Font: "

    invoke-virtual {p4, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p4, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {p4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-direct {p0, p1}, Landroid/content/res/Resources$NotFoundException;-><init>(Ljava/lang/String;)V

    throw p0
.end method
