.class public abstract Lcom/astrob/turbodog/a/b$a;
.super Landroid/os/Binder;

# interfaces
.implements Lcom/astrob/turbodog/a/b;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/astrob/turbodog/a/b;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x409
    name = "a"
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/astrob/turbodog/a/b$a$a;
    }
.end annotation


# direct methods
.method public static a()Lcom/astrob/turbodog/a/b;
    .locals 1

    sget-object v0, Lcom/astrob/turbodog/a/b$a$a;->a:Lcom/astrob/turbodog/a/b;

    return-object v0
.end method


# virtual methods
.method public onTransact(ILandroid/os/Parcel;Landroid/os/Parcel;I)Z
    .locals 3

    const-string v0, "com.astrob.turbodog.navilibvr.INaviCallback"

    const/4 v1, 0x1

    if-eq p1, v1, :cond_1

    const v2, 0x5f4e5446

    if-eq p1, v2, :cond_0

    invoke-super {p0, p1, p2, p3, p4}, Landroid/os/Binder;->onTransact(ILandroid/os/Parcel;Landroid/os/Parcel;I)Z

    move-result p1

    return p1

    :cond_0
    invoke-virtual {p3, v0}, Landroid/os/Parcel;->writeString(Ljava/lang/String;)V

    return v1

    :cond_1
    invoke-virtual {p2, v0}, Landroid/os/Parcel;->enforceInterface(Ljava/lang/String;)V

    invoke-virtual {p2}, Landroid/os/Parcel;->readString()Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0, p1}, Lcom/astrob/turbodog/a/b$a;->a(Ljava/lang/String;)V

    invoke-virtual {p3}, Landroid/os/Parcel;->writeNoException()V

    return v1
.end method
