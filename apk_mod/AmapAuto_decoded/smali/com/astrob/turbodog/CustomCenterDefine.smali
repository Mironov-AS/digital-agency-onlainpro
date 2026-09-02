.class Lcom/astrob/turbodog/CustomCenterDefine;
.super Ljava/lang/Object;


# static fields
.field private static center:Lcom/astrob/turbodog/GenericCustomCenter;


# direct methods
.method static constructor <clinit>()V
    .locals 0

    return-void
.end method

.method constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method static getCustomCenter()Lcom/astrob/turbodog/GenericCustomCenter;
    .locals 2

    sget-object v0, Lcom/astrob/turbodog/CustomCenterDefine;->center:Lcom/astrob/turbodog/GenericCustomCenter;

    if-nez v0, :cond_0

    :try_start_0
    const-string v0, "FLAVORS_CUSTOM_CENTER"

    const-class v1, Lcom/astrob/turbodog/BuildConfig;

    invoke-virtual {v1, v0}, Ljava/lang/Class;->getField(Ljava/lang/String;)Ljava/lang/reflect/Field;

    move-result-object v0

    const-class v1, Lcom/astrob/turbodog/BuildConfig;

    invoke-virtual {v0, v1}, Ljava/lang/reflect/Field;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Ljava/lang/String;

    invoke-static {v0}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->newInstance()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lcom/astrob/turbodog/GenericCustomCenter;

    sput-object v0, Lcom/astrob/turbodog/CustomCenterDefine;->center:Lcom/astrob/turbodog/GenericCustomCenter;
    :try_end_0
    .catch Ljava/lang/ClassNotFoundException; {:try_start_0 .. :try_end_0} :catch_3
    .catch Ljava/lang/IllegalAccessException; {:try_start_0 .. :try_end_0} :catch_2
    .catch Ljava/lang/InstantiationException; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/NoSuchFieldException; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/NoSuchFieldException;->printStackTrace()V

    goto :goto_0

    :catch_1
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/InstantiationException;->printStackTrace()V

    goto :goto_0

    :catch_2
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/IllegalAccessException;->printStackTrace()V

    goto :goto_0

    :catch_3
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/ClassNotFoundException;->printStackTrace()V

    :goto_0
    sget-object v0, Lcom/astrob/turbodog/CustomCenterDefine;->center:Lcom/astrob/turbodog/GenericCustomCenter;

    if-nez v0, :cond_0

    new-instance v0, Lcom/astrob/turbodog/GenericCustomCenter;

    invoke-direct {v0}, Lcom/astrob/turbodog/GenericCustomCenter;-><init>()V

    sput-object v0, Lcom/astrob/turbodog/CustomCenterDefine;->center:Lcom/astrob/turbodog/GenericCustomCenter;

    :cond_0
    sget-object v0, Lcom/astrob/turbodog/CustomCenterDefine;->center:Lcom/astrob/turbodog/GenericCustomCenter;

    return-object v0
.end method
