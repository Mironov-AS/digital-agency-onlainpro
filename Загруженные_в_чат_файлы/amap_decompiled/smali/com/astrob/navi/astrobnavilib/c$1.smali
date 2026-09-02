.class final Lcom/astrob/navi/astrobnavilib/c$1;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/location/LocationListener;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/navi/astrobnavilib/c;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = null
.end annotation


# direct methods
.method constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final onLocationChanged(Landroid/location/Location;)V
    .locals 2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->b()I

    move-result v0

    if-gtz v0, :cond_0

    return-void

    :cond_0
    if-eqz p1, :cond_3

    :try_start_0
    invoke-static {p1}, Lcom/astrob/navi/astrobnavilib/c;->a(Landroid/location/Location;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Ljava/lang/Exception;->printStackTrace()V

    :goto_0
    new-instance p1, Ljava/lang/StringBuilder;

    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->c()Z

    move-result v0

    if-eqz v0, :cond_1

    const-string v0, "$"

    goto :goto_1

    :cond_1
    const-string v0, ""

    :goto_1
    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->d()Lorg/json/JSONObject;

    move-result-object v0

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v0, "$"

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p1}, Ljava/lang/String;->getBytes()[B

    move-result-object p1

    array-length v0, p1

    sget-boolean v1, Lcom/astrob/navi/astrobnavilib/c;->a:Z

    if-nez v1, :cond_2

    invoke-static {p1, v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->AstrobGPSPostNMEA([BI)V

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v0

    invoke-static {v0, v1}, Lcom/astrob/navi/astrobnavilib/c;->a(J)J

    :cond_2
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->e()Z

    :cond_3
    return-void
.end method

.method public final onProviderDisabled(Ljava/lang/String;)V
    .locals 0

    return-void
.end method

.method public final onProviderEnabled(Ljava/lang/String;)V
    .locals 0

    return-void
.end method

.method public final onStatusChanged(Ljava/lang/String;ILandroid/os/Bundle;)V
    .locals 0

    const/4 p1, 0x2

    const/4 p3, 0x1

    if-ne p2, p1, :cond_0

    :try_start_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->f()Ljava/lang/String;

    move-result-object p1

    const-string p2, "\u5f53\u524dGPS\u72b6\u6001\uff1a\u53ef\u89c1"

    invoke-static {p1, p2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->d()Lorg/json/JSONObject;

    move-result-object p1

    const-string p2, "fixed"

    invoke-virtual {p1, p2, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    return-void

    :catch_0
    move-exception p1

    goto :goto_0

    :cond_0
    const/4 p1, 0x0

    if-nez p2, :cond_1

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->f()Ljava/lang/String;

    move-result-object p2

    const-string p3, "\u5f53\u524dGPS\u72b6\u6001\uff1a\u670d\u52a1\u533a\u5916"

    invoke-static {p2, p3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->d()Lorg/json/JSONObject;

    move-result-object p2

    const-string p3, "fixed"

    invoke-virtual {p2, p3, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    return-void

    :cond_1
    if-ne p2, p3, :cond_2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->f()Ljava/lang/String;

    move-result-object p2

    const-string p3, "\u5f53\u524dGPS\u72b6\u6001\uff1a\u6682\u505c\u670d\u52a1"

    invoke-static {p2, p3}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->d()Lorg/json/JSONObject;

    move-result-object p2

    const-string p3, "fixed"

    invoke-virtual {p2, p3, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_1

    :goto_0
    invoke-virtual {p1}, Ljava/lang/Exception;->printStackTrace()V

    :cond_2
    :goto_1
    return-void
.end method
