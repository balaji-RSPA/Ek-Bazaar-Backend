
module.exports.config = {
    "properties": {
        "serviceType": {
            "properties": {
                "name": {
                    "type": "keyword"
                },
                "_id": {
                    "type": "keyword"
                }
            }
        },
        "flag": {
            "type": "long"
        },
        "keywords": {
            "type": "text"
        },
        "serviceCity": {
            "type": "nested",
            "properties": {
                "country": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword"
                        },
                        "_id": {
                            "type": "keyword"
                        }
                    }
                },
                "city": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword"
                        },
                        "_id": {
                            "type": "keyword"
                        }
                    }
                },
                "_id": {
                    "type": "keyword"
                },
                "state": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword"
                        },
                        "_id": {
                            "type": "keyword"
                        }
                    }
                }
            }
        },
        "userId": {
            "type": "keyword"
        },
        "sellerId": {
            "type": "nested",
            "properties": {
                "mobile": {
                    "type": "nested",
                    "properties": {
                        "countryCode": {
                            "type": "text"
                        },
                        "mobile": {
                            "type": "text"
                        },
                        "_id": {
                            "type": "keyword"
                        }
                    }
                },
                "name": {
                    "type": "keyword"
                },
                "location": {
                    "type": "nested",
                    "properties": {
                        "country": {
                            "type": "nested",
                            "properties": {
                                "name": {
                                    "type": "keyword"
                                },
                                "_id": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "address": {
                            "type": "text"
                        },
                        "city": {
                            "type": "nested",
                            "properties": {
                                "name": {
                                    "type": "keyword"
                                },
                                "_id": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "state": {
                            "type": "nested",
                            "properties": {
                                "name": {
                                    "type": "keyword"
                                },
                                "_id": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "pincode": {
                            "type": "text"
                        }
                    }
                },
                "_id": {
                    "type": "keyword"
                },
                "source": {
                    "type": "text"
                },
                "sellerType": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword"
                        },
                        "_id": {
                            "type": "keyword"
                        }
                    }
                }
            }
        },
        "parentCategoryId": {
            "type": "nested",
            "properties": {
                "name": {
                    "type": "keyword"
                },
                "vendorId": {
                    "type": "text"
                },
                "_id": {
                    "type": "keyword"
                }
            }
        },
        "primaryCategoryId": {
            "type": "nested",
            "properties": {
                "name": {
                    "type": "keyword"
                },
                "vendorId": {
                    "type": "text"
                },
                "_id": {
                    "type": "keyword"
                }
            }
        },
        "secondaryCategoryId": {
            "type": "nested",
            "properties": {
                "name": {
                    "type": "keyword"
                },
                "vendorId": {
                    "type": "text"
                },
                "_id": {
                    "type": "keyword"
                }
            }
        },
        "poductId": {
            "type": "nested",
            "properties": {
                "name": {
                    "type": "keyword"
                },
                "vendorId": {
                    "type": "text"
                },
                "_id": {
                    "type": "keyword"
                }
            }
        },
        "productSubcategoryId": {
            "type": "nested",
            "properties": {
                "name": {
                    "type": "keyword"
                },
                "vendorId": {
                    "type": "text"
                },
                "_id": {
                    "type": "keyword"
                }
            }
        },
        "status": {
            "type": "boolean"
        },
        "batch": {
            "type": "long"
        },
        "createdAt": {
            "type": "date"
        },
        "updatedAt": {
            "type": "date"
        }
    }
}