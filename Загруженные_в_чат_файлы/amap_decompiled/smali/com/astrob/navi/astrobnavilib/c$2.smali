.class final Lcom/astrob/navi/astrobnavilib/c$2;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/location/GpsStatus$Listener;


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
.method public final onGpsStatusChanged(I)V
    .locals 7

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->b()I

    move-result v0

    if-gtz v0, :cond_0

    return-void

    :cond_0
    packed-switch p1, :pswitch_data_0

    goto/16 :goto_3

    :pswitch_0
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->g()Landroid/content/Context;

    move-result-object p1

    const-string v0, "android.permission.ACCESS_FINE_LOCATION"

    invoke-static {p1, v0}, Landroid/support/v4/a/a;->a(Landroid/content/Context;Ljava/lang/String;)I

    move-result p1

    if-nez p1, :cond_5

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->h()Landroid/location/LocationManager;

    move-result-object p1

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Landroid/location/LocationManager;->getGpsStatus(Landroid/location/GpsStatus;)Landroid/location/GpsStatus;

    move-result-object p1

    invoke-virtual {p1}, Landroid/location/GpsStatus;->getMaxSatellites()I

    move-result v0

    invoke-virtual {p1}, Landroid/location/GpsStatus;->getSatellites()Ljava/lang/Iterable;

    move-result-object p1

    invoke-interface {p1}, Ljava/lang/Iterable;->iterator()Ljava/util/Iterator;

    move-result-object p1

    new-instance v1, Lorg/json/JSONArray;

    invoke-direct {v1}, Lorg/json/JSONArray;-><init>()V

    :goto_0
    :try_start_0
    invoke-interface {p1}, Ljava/util/Iterator;->hasNext()Z

    move-result v2

    if-eqz v2, :cond_1

    if-ltz v0, :cond_1

    invoke-interface {p1}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Landroid/location/GpsSatellite;

    new-instance v3, Lorg/json/JSONObject;

    invoke-direct {v3}, Lorg/json/JSONObject;-><init>()V

    const-string v4, "prn"

    invoke-virtual {v2}, Landroid/location/GpsSatellite;->getPrn()I

    move-result v5

    invoke-virtual {v3, v4, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;I)Lorg/json/JSONObject;

    const-string v4, "snr"

    invoke-virtual {v2}, Landroid/location/GpsSatellite;->getSnr()F

    move-result v5

    float-to-double v5, v5

    invoke-virtual {v3, v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v4, "azimuth"

    invoke-virtual {v2}, Landroid/location/GpsSatellite;->getAzimuth()F

    move-result v5

    float-to-double v5, v5

    invoke-virtual {v3, v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v4, "elevation"

    invoke-virtual {v2}, Landroid/location/GpsSatellite;->getElevation()F

    move-result v5

    float-to-double v5, v5

    invoke-virtual {v3, v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v4, "usedInFix"

    invoke-virtual {v2}, Landroid/location/GpsSatellite;->usedInFix()Z

    move-result v2

    invoke-virtual {v3, v4, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    invoke-virtual {v1, v3}, Lorg/json/JSONArray;->put(Ljava/lang/Object;)Lorg/json/JSONArray;

    goto :goto_0

    :cond_1
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->d()Lorg/json/JSONObject;

    move-result-object p1

    const-string v0, "satellites"

    invoke-virtual {p1, v0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    sget-boolean p1, Lcom/astrob/navi/astrobnavilib/c;->a:Z

    if-nez p1, :cond_4

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v0

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->i()J

    move-result-wide v2

    sub-long/2addr v0, v2

    const-wide/16 v2, 0x7d0

    cmp-long p1, v0, v2

    if-lez p1, :cond_2

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->d()Lorg/json/JSONObject;

    move-result-object p1

    const-string v0, "fixed"

    const/4 v1, 0x0

    invoke-virtual {p1, v0, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    :cond_2
    new-instance p1, Ljava/lang/StringBuilder;

    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->c()Z

    move-result v0

    if-eqz v0, :cond_3

    const-string v0, "$"

    goto :goto_1

    :cond_3
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

    invoke-static {p1, v0}, Lcom/astrob/navi/astrobnavilib/JavaToJni;->AstrobGPSPostNMEA([BI)V

    :cond_4
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->e()Z
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p1

    invoke-virtual {p1}, Ljava/lang/Exception;->printStackTrace()V

    return-void

    :pswitch_1
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->f()Ljava/lang/String;

    move-result-object p1

    const-string v0, "\u7b2c\u4e00\u6b21\u5b9a\u4f4d"

    :goto_2
    invoke-static {p1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    return-void

    :pswitch_2
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->f()Ljava/lang/String;

    move-result-object p1

    const-string v0, "\u5b9a\u4f4d\u7ed3\u675f"

    invoke-static {p1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    goto :goto_3

    :pswitch_3
    invoke-static {}, Lcom/astrob/navi/astrobnavilib/c;->f()Ljava/lang/String;

    move-result-object p1

    const-string v0, "\u5b9a\u4f4d\u542f\u52a8"

    goto :goto_2

    :cond_5
    :goto_3
    return-void

    nop

    :pswitch_data_0
    .packed-switch 0x1
        :pswitch_3
        :pswitch_2
        :pswitch_1
        :pswitch_0
    .end packed-switch
.end method
