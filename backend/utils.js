const MAX_LEN = {
    message: 500,
    username: 50,
    reactionType: 20,
    title: 100,
    hostName: 50,
    category: 50,
    pollQuestion: 200,
    pollOption: 100,
    couponCode: 50
};

const sanitize = (str, maxLen) => {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/g, '').trim().substring(0, maxLen);
};

module.exports = { MAX_LEN, sanitize };
