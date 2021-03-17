
module.exports.config = {
    "properties": {
        "serviceType": {
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
                },
                "website": {
                    "type": "text",
                },
                "isEmailVerified": {
                    "type": "boolean",
                },
                "isPhoneVerified": {
                    "type": "boolean",
                },
                "sellerVerified": {
                    "type": "boolean",
                },
                "paidSeller": {
                    "type": "boolean",
                },
                "international": {
                    "type": "boolean",
                },
                "deactivateAccount": {
                    "type": "boolean",
                },
                "businessName": {
                    "type": "keyword",
                },
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
        "productDetails": {
            "type": "nested",
            "properties": {
                "name": {
                    "type": "keyword",
                },
                "price": {
                    "type": "nested",
                    "properties": {
                        "price": {
                            "type": "text"
                        },
                        "unit": {
                            "type": "text"
                        }
                    }
                },
                "minmumOrderQty": {
                    "type": "nested",
                    "properties": {
                        "quantity": {
                            "type": "text"
                        },
                        "unit": {
                            "type": "text"
                        }
                    }
                },
                "deliveryTime": {
                    "type": "nested",
                    "properties": {
                        "deliveryTime": {
                            "type": "text"
                        },
                        "unit": {
                            "type": "text"
                        }
                    }
                },
                "packagingDetails": {
                    "type": "nested",
                    "properties": {
                        "packagingDetail": {
                            "type": "text"
                        },
                        "packagingUnit": {
                            "type": "text"
                        }
                    }
                },
                "countryOfOrigin": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword"
                        },
                        "_id": {
                            "type": "text"
                        }
                    }
                },
                "regionOfOrigin": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword"
                        },
                        "_id": {
                            "type": "text"
                        }
                    }
                },
                "cityOfOrigin": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword"
                        },
                        "_id": {
                            "type": "text"
                        }
                    }
                },
                "productDescription": {
                    "type": "text"
                },
                "inStock": {
                    "type": "boolean"
                },
                "document": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "keyword",
                        },
                        "code": {
                            "type": "text",
                        }
                    }
                },
                "image": {
                    "type": "nested",
                    "properties": {
                        "image1": {
                            "type": "nested",
                            "properties": {

                                "name": {
                                    "type": "keyword"
                                },
                                "code": {
                                    "type": "text"
                                }
                            }
                        },
                        "image2": {
                            "type": "nested",
                            "properties": {
                                "name": {
                                    "type": "keyword"
                                },
                                "code": {
                                    "type": "text"
                                }
                            }
                        },
                        "image3": {
                            "type": "nested",
                            "properties": {
                                "name": {
                                    "type": "keyword"
                                },
                                "code": {
                                    "type": "text"
                                }
                            }
                        },
                        "image4": {
                            "type": "nested",
                            "properties": {
                                "name": {
                                    "type": "keyword"
                                },
                                "code": {
                                    "type": "text"
                                }
                            }
                        }
                    }
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