.class public Lcom/alibaba/fastjson/util/UTF8Decoder;
.super Ljava/nio/charset/CharsetDecoder;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/alibaba/fastjson/util/UTF8Decoder$Surrogate;
    }
.end annotation


# static fields
.field private static final charset:Ljava/nio/charset/Charset;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    const-string v0, "UTF-8"

    invoke-static {v0}, Ljava/nio/charset/Charset;->forName(Ljava/lang/String;)Ljava/nio/charset/Charset;

    move-result-object v0

    sput-object v0, Lcom/alibaba/fastjson/util/UTF8Decoder;->charset:Ljava/nio/charset/Charset;

    return-void
.end method

.method public constructor <init>()V
    .locals 2

    sget-object v0, Lcom/alibaba/fastjson/util/UTF8Decoder;->charset:Ljava/nio/charset/Charset;

    const/high16 v1, 0x3f800000    # 1.0f

    invoke-direct {p0, v0, v1, v1}, Ljava/nio/charset/CharsetDecoder;-><init>(Ljava/nio/charset/Charset;FF)V

    return-void
.end method

.method private decodeArrayLoop(Ljava/nio/ByteBuffer;Ljava/nio/CharBuffer;)Ljava/nio/charset/CoderResult;
    .locals 12

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->array()[B

    move-result-object v0

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->arrayOffset()I

    move-result v1

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->position()I

    move-result v2

    add-int/2addr v1, v2

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->arrayOffset()I

    move-result v2

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->limit()I

    move-result v3

    add-int v6, v2, v3

    invoke-virtual {p2}, Ljava/nio/CharBuffer;->array()[C

    move-result-object v2

    invoke-virtual {p2}, Ljava/nio/CharBuffer;->arrayOffset()I

    move-result v3

    invoke-virtual {p2}, Ljava/nio/CharBuffer;->position()I

    move-result v4

    add-int/2addr v3, v4

    invoke-virtual {p2}, Ljava/nio/CharBuffer;->arrayOffset()I

    move-result v4

    invoke-virtual {p2}, Ljava/nio/CharBuffer;->limit()I

    move-result v5

    add-int/2addr v4, v5

    sub-int v5, v6, v1

    sub-int v7, v4, v3

    invoke-static {v5, v7}, Ljava/lang/Math;->min(II)I

    move-result v5

    add-int/2addr v5, v3

    :goto_0
    if-ge v3, v5, :cond_0

    aget-byte v7, v0, v1

    if-ltz v7, :cond_0

    add-int/lit8 v7, v3, 0x1

    add-int/lit8 v8, v1, 0x1

    aget-byte v1, v0, v1

    int-to-char v1, v1

    aput-char v1, v2, v3

    move v3, v7

    move v1, v8

    goto :goto_0

    :cond_0
    move v5, v1

    :goto_1
    move v8, v3

    :goto_2
    if-ge v5, v6, :cond_10

    aget-byte v1, v0, v5

    if-ltz v1, :cond_2

    if-lt v8, v4, :cond_1

    const/4 v9, 0x1

    move-object v4, p1

    move-object v7, p2

    invoke-static/range {v4 .. v9}, Lcom/alibaba/fastjson/util/UTF8Decoder;->xflow(Ljava/nio/Buffer;IILjava/nio/Buffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_1
    add-int/lit8 v3, v8, 0x1

    int-to-char v1, v1

    aput-char v1, v2, v8

    add-int/lit8 v5, v5, 0x1

    goto :goto_1

    :cond_2
    shr-int/lit8 v3, v1, 0x5

    const/4 v7, -0x2

    const/4 v9, 0x2

    if-ne v3, v7, :cond_6

    sub-int v3, v6, v5

    if-lt v3, v9, :cond_5

    if-lt v8, v4, :cond_3

    goto :goto_4

    :cond_3
    add-int/lit8 v3, v5, 0x1

    aget-byte v3, v0, v3

    invoke-static {v1, v3}, Lcom/alibaba/fastjson/util/UTF8Decoder;->isMalformed2(II)Z

    move-result v7

    if-eqz v7, :cond_4

    invoke-static {p1, v5, p2, v8, v9}, Lcom/alibaba/fastjson/util/UTF8Decoder;->malformed(Ljava/nio/ByteBuffer;ILjava/nio/CharBuffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_4
    add-int/lit8 v7, v8, 0x1

    shl-int/lit8 v1, v1, 0x6

    xor-int/2addr v1, v3

    xor-int/lit16 v1, v1, 0xf80

    int-to-char v1, v1

    aput-char v1, v2, v8

    add-int/lit8 v5, v5, 0x2

    :goto_3
    move v8, v7

    goto :goto_2

    :cond_5
    :goto_4
    const/4 v9, 0x2

    move-object v4, p1

    move-object v7, p2

    invoke-static/range {v4 .. v9}, Lcom/alibaba/fastjson/util/UTF8Decoder;->xflow(Ljava/nio/Buffer;IILjava/nio/Buffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_6
    shr-int/lit8 v3, v1, 0x4

    if-ne v3, v7, :cond_a

    sub-int v3, v6, v5

    const/4 v7, 0x3

    if-lt v3, v7, :cond_9

    if-lt v8, v4, :cond_7

    goto :goto_5

    :cond_7
    add-int/lit8 v3, v5, 0x1

    aget-byte v3, v0, v3

    add-int/lit8 v9, v5, 0x2

    aget-byte v9, v0, v9

    invoke-static {v1, v3, v9}, Lcom/alibaba/fastjson/util/UTF8Decoder;->isMalformed3(III)Z

    move-result v10

    if-eqz v10, :cond_8

    invoke-static {p1, v5, p2, v8, v7}, Lcom/alibaba/fastjson/util/UTF8Decoder;->malformed(Ljava/nio/ByteBuffer;ILjava/nio/CharBuffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_8
    add-int/lit8 v7, v8, 0x1

    shl-int/lit8 v1, v1, 0xc

    shl-int/lit8 v3, v3, 0x6

    xor-int/2addr v1, v3

    xor-int/2addr v1, v9

    xor-int/lit16 v1, v1, 0x1f80

    int-to-char v1, v1

    aput-char v1, v2, v8

    add-int/lit8 v5, v5, 0x3

    goto :goto_3

    :cond_9
    :goto_5
    const/4 v9, 0x3

    move-object v4, p1

    move-object v7, p2

    invoke-static/range {v4 .. v9}, Lcom/alibaba/fastjson/util/UTF8Decoder;->xflow(Ljava/nio/Buffer;IILjava/nio/Buffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_a
    shr-int/lit8 v3, v1, 0x3

    if-ne v3, v7, :cond_f

    sub-int v3, v6, v5

    const/4 v7, 0x4

    if-lt v3, v7, :cond_e

    sub-int v3, v4, v8

    if-ge v3, v9, :cond_b

    goto :goto_7

    :cond_b
    add-int/lit8 v3, v5, 0x1

    aget-byte v3, v0, v3

    add-int/lit8 v9, v5, 0x2

    aget-byte v9, v0, v9

    add-int/lit8 v10, v5, 0x3

    aget-byte v10, v0, v10

    and-int/lit8 v1, v1, 0x7

    shl-int/lit8 v1, v1, 0x12

    and-int/lit8 v11, v3, 0x3f

    shl-int/lit8 v11, v11, 0xc

    or-int/2addr v1, v11

    and-int/lit8 v11, v9, 0x3f

    shl-int/lit8 v11, v11, 0x6

    or-int/2addr v1, v11

    and-int/lit8 v11, v10, 0x3f

    or-int/2addr v1, v11

    invoke-static {v3, v9, v10}, Lcom/alibaba/fastjson/util/UTF8Decoder;->isMalformed4(III)Z

    move-result v3

    if-nez v3, :cond_d

    invoke-static {v1}, Lcom/alibaba/fastjson/util/UTF8Decoder$Surrogate;->neededFor(I)Z

    move-result v3

    if-nez v3, :cond_c

    goto :goto_6

    :cond_c
    add-int/lit8 v3, v8, 0x1

    invoke-static {v1}, Lcom/alibaba/fastjson/util/UTF8Decoder$Surrogate;->high(I)C

    move-result v7

    aput-char v7, v2, v8

    add-int/lit8 v8, v3, 0x1

    invoke-static {v1}, Lcom/alibaba/fastjson/util/UTF8Decoder$Surrogate;->low(I)C

    move-result v1

    aput-char v1, v2, v3

    add-int/lit8 v5, v5, 0x4

    goto/16 :goto_2

    :cond_d
    :goto_6
    invoke-static {p1, v5, p2, v8, v7}, Lcom/alibaba/fastjson/util/UTF8Decoder;->malformed(Ljava/nio/ByteBuffer;ILjava/nio/CharBuffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_e
    :goto_7
    const/4 v9, 0x4

    move-object v4, p1

    move-object v7, p2

    invoke-static/range {v4 .. v9}, Lcom/alibaba/fastjson/util/UTF8Decoder;->xflow(Ljava/nio/Buffer;IILjava/nio/Buffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_f
    const/4 v0, 0x1

    invoke-static {p1, v5, p2, v8, v0}, Lcom/alibaba/fastjson/util/UTF8Decoder;->malformed(Ljava/nio/ByteBuffer;ILjava/nio/CharBuffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1

    :cond_10
    const/4 v9, 0x0

    move-object v4, p1

    move-object v7, p2

    invoke-static/range {v4 .. v9}, Lcom/alibaba/fastjson/util/UTF8Decoder;->xflow(Ljava/nio/Buffer;IILjava/nio/Buffer;II)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1
.end method

.method private static isMalformed2(II)Z
    .locals 0

    and-int/lit8 p0, p0, 0x1e

    if-eqz p0, :cond_1

    and-int/lit16 p0, p1, 0xc0

    const/16 p1, 0x80

    if-eq p0, p1, :cond_0

    goto :goto_0

    :cond_0
    const/4 p0, 0x0

    return p0

    :cond_1
    :goto_0
    const/4 p0, 0x1

    return p0
.end method

.method private static isMalformed3(III)Z
    .locals 2

    const/16 v0, 0x80

    const/16 v1, -0x20

    if-ne p0, v1, :cond_0

    and-int/lit16 p0, p1, 0xe0

    if-eq p0, v0, :cond_2

    :cond_0
    and-int/lit16 p0, p1, 0xc0

    if-ne p0, v0, :cond_2

    and-int/lit16 p0, p2, 0xc0

    if-eq p0, v0, :cond_1

    goto :goto_0

    :cond_1
    const/4 p0, 0x0

    return p0

    :cond_2
    :goto_0
    const/4 p0, 0x1

    return p0
.end method

.method private static isMalformed4(III)Z
    .locals 1

    and-int/lit16 p0, p0, 0xc0

    const/16 v0, 0x80

    if-ne p0, v0, :cond_1

    and-int/lit16 p0, p1, 0xc0

    if-ne p0, v0, :cond_1

    and-int/lit16 p0, p2, 0xc0

    if-eq p0, v0, :cond_0

    goto :goto_0

    :cond_0
    const/4 p0, 0x0

    return p0

    :cond_1
    :goto_0
    const/4 p0, 0x1

    return p0
.end method

.method private static isNotContinuation(I)Z
    .locals 1

    and-int/lit16 p0, p0, 0xc0

    const/16 v0, 0x80

    if-eq p0, v0, :cond_0

    const/4 p0, 0x1

    return p0

    :cond_0
    const/4 p0, 0x0

    return p0
.end method

.method private static lookupN(Ljava/nio/ByteBuffer;I)Ljava/nio/charset/CoderResult;
    .locals 2

    const/4 v0, 0x1

    :goto_0
    if-ge v0, p1, :cond_1

    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->get()B

    move-result v1

    invoke-static {v1}, Lcom/alibaba/fastjson/util/UTF8Decoder;->isNotContinuation(I)Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-static {v0}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :cond_0
    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_1
    invoke-static {p1}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0
.end method

.method private static malformed(Ljava/nio/ByteBuffer;ILjava/nio/CharBuffer;II)Ljava/nio/charset/CoderResult;
    .locals 1

    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->arrayOffset()I

    move-result v0

    sub-int v0, p1, v0

    invoke-virtual {p0, v0}, Ljava/nio/ByteBuffer;->position(I)Ljava/nio/Buffer;

    invoke-static {p0, p4}, Lcom/alibaba/fastjson/util/UTF8Decoder;->malformedN(Ljava/nio/ByteBuffer;I)Ljava/nio/charset/CoderResult;

    move-result-object p4

    invoke-static {p0, p1, p2, p3}, Lcom/alibaba/fastjson/util/UTF8Decoder;->updatePositions(Ljava/nio/Buffer;ILjava/nio/Buffer;I)V

    return-object p4
.end method

.method public static malformedN(Ljava/nio/ByteBuffer;I)Ljava/nio/charset/CoderResult;
    .locals 6

    const/16 v0, 0x80

    const/4 v1, 0x2

    const/4 v2, 0x1

    packed-switch p1, :pswitch_data_0

    new-instance p0, Ljava/lang/IllegalStateException;

    invoke-direct {p0}, Ljava/lang/IllegalStateException;-><init>()V

    throw p0

    :pswitch_0
    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->get()B

    move-result p1

    and-int/lit16 p1, p1, 0xff

    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->get()B

    move-result v3

    and-int/lit16 v3, v3, 0xff

    const/16 v4, 0xf4

    if-gt p1, v4, :cond_4

    const/16 v5, 0xf0

    if-ne p1, v5, :cond_0

    const/16 v5, 0x90

    if-lt v3, v5, :cond_4

    const/16 v5, 0xbf

    if-gt v3, v5, :cond_4

    :cond_0
    if-ne p1, v4, :cond_1

    and-int/lit16 p1, v3, 0xf0

    if-ne p1, v0, :cond_4

    :cond_1
    invoke-static {v3}, Lcom/alibaba/fastjson/util/UTF8Decoder;->isNotContinuation(I)Z

    move-result p1

    if-eqz p1, :cond_2

    goto :goto_0

    :cond_2
    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->get()B

    move-result p0

    invoke-static {p0}, Lcom/alibaba/fastjson/util/UTF8Decoder;->isNotContinuation(I)Z

    move-result p0

    if-eqz p0, :cond_3

    invoke-static {v1}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :cond_3
    const/4 p0, 0x3

    invoke-static {p0}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :cond_4
    :goto_0
    invoke-static {v2}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :pswitch_1
    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->get()B

    move-result p1

    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->get()B

    move-result p0

    const/16 v3, -0x20

    if-ne p1, v3, :cond_5

    and-int/lit16 p1, p0, 0xe0

    if-eq p1, v0, :cond_6

    :cond_5
    invoke-static {p0}, Lcom/alibaba/fastjson/util/UTF8Decoder;->isNotContinuation(I)Z

    move-result p0

    if-eqz p0, :cond_7

    :cond_6
    const/4 v1, 0x1

    :cond_7
    invoke-static {v1}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :pswitch_2
    invoke-static {v2}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :pswitch_3
    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->get()B

    move-result p1

    shr-int/lit8 v0, p1, 0x2

    const/4 v1, 0x5

    const/4 v3, -0x2

    if-ne v0, v3, :cond_9

    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->remaining()I

    move-result p1

    const/4 v0, 0x4

    if-ge p1, v0, :cond_8

    sget-object p0, Ljava/nio/charset/CoderResult;->UNDERFLOW:Ljava/nio/charset/CoderResult;

    return-object p0

    :cond_8
    invoke-static {p0, v1}, Lcom/alibaba/fastjson/util/UTF8Decoder;->lookupN(Ljava/nio/ByteBuffer;I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :cond_9
    shr-int/2addr p1, v2

    if-ne p1, v3, :cond_b

    invoke-virtual {p0}, Ljava/nio/ByteBuffer;->remaining()I

    move-result p1

    if-ge p1, v1, :cond_a

    sget-object p0, Ljava/nio/charset/CoderResult;->UNDERFLOW:Ljava/nio/charset/CoderResult;

    return-object p0

    :cond_a
    const/4 p1, 0x6

    invoke-static {p0, p1}, Lcom/alibaba/fastjson/util/UTF8Decoder;->lookupN(Ljava/nio/ByteBuffer;I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    :cond_b
    invoke-static {v2}, Ljava/nio/charset/CoderResult;->malformedForLength(I)Ljava/nio/charset/CoderResult;

    move-result-object p0

    return-object p0

    nop

    :pswitch_data_0
    .packed-switch 0x1
        :pswitch_3
        :pswitch_2
        :pswitch_1
        :pswitch_0
    .end packed-switch
.end method

.method static updatePositions(Ljava/nio/Buffer;ILjava/nio/Buffer;I)V
    .locals 0

    invoke-virtual {p0, p1}, Ljava/nio/Buffer;->position(I)Ljava/nio/Buffer;

    invoke-virtual {p2, p3}, Ljava/nio/Buffer;->position(I)Ljava/nio/Buffer;

    return-void
.end method

.method private static xflow(Ljava/nio/Buffer;IILjava/nio/Buffer;II)Ljava/nio/charset/CoderResult;
    .locals 0

    invoke-static {p0, p1, p3, p4}, Lcom/alibaba/fastjson/util/UTF8Decoder;->updatePositions(Ljava/nio/Buffer;ILjava/nio/Buffer;I)V

    if-eqz p5, :cond_1

    sub-int/2addr p2, p1

    if-ge p2, p5, :cond_0

    goto :goto_0

    :cond_0
    sget-object p0, Ljava/nio/charset/CoderResult;->OVERFLOW:Ljava/nio/charset/CoderResult;

    return-object p0

    :cond_1
    :goto_0
    sget-object p0, Ljava/nio/charset/CoderResult;->UNDERFLOW:Ljava/nio/charset/CoderResult;

    return-object p0
.end method


# virtual methods
.method protected decodeLoop(Ljava/nio/ByteBuffer;Ljava/nio/CharBuffer;)Ljava/nio/charset/CoderResult;
    .locals 0

    invoke-direct {p0, p1, p2}, Lcom/alibaba/fastjson/util/UTF8Decoder;->decodeArrayLoop(Ljava/nio/ByteBuffer;Ljava/nio/CharBuffer;)Ljava/nio/charset/CoderResult;

    move-result-object p1

    return-object p1
.end method
