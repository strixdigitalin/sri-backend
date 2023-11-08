const express = require('express');
const jwt = require("jsonwebtoken");
const app = express()
const cors = require('cors');
const mongoose = require('mongoose');
const Seller_Register = require('./models/Seller_RegisterModel')
const UserModel = require('./models/UserModel');
const Product = require('./models/Products');
const Middleware = require("./Middleware/Auth");

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongodburl = process.env.MONGODBURL

// =============[encrypt password]==================//
const bcrypt = require('bcrypt');
const Admin = require('./models/AdminModel');
const Category = require('./models/CategoryModel');
const CityModel = require('./models/CityModel');
const ProductQuery = require('./models/ProductQuerymodel');
const Blogs = require('./models/BlogModel');

app.use(express.json())

app.use(cors({
    origin: '*'
}));
app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));


app.get('/', (req, res) => {
    res.send('hello node  api')
})



// =====================================[Admin Apis]=======================================//

// =============[Admin login api]==================//


app.post('/AdminRegister', async function (req, res) {

    try {
        let data = req.body;
        let {
            Name,
            Primary_Email,
            password,
            confirm_password,
        } = data;


        if (password !== confirm_password) {
            res.status(400).json({
                message: "Password and Confirm password not match"
            });
        }
        if (await Admin.findOne({ Primary_Email: Primary_Email }))
            return res.status(400).send({ message: "Email already exist" });

        const encryptedPassword = bcrypt.hashSync(password, 12);
        req.body["password"] = encryptedPassword;

        var token = jwt.sign(
            {
                userId: Admin._id,
            },
            "project"
        );
        data.token = token;

        let savedData = await Admin.create(data);
        res.status(201).send({
            status: true,
            message: "Admin Register successfull",
            data: savedData
        });
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
}
)

// =============[Admin login api]==================//

app.post('/AdminLogin', async function (req, res) {
    try {
        let data = req.body;
        let { Primary_Email, password } = data;

        let user = await Admin.findOne({ Primary_Email: Primary_Email });

        if (!user) {
            return res.status(400).send({
                status: false,
                message: "Email and Password is Invalid",
            });
        }

        let compared = await bcrypt.compare(password, user.password);
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid",
            });
        }
        var token = jwt.sign(
            {
                userId: user._id,
            },
            "project"
        );

        let updateToken = await Admin.findByIdAndUpdate(
            { _id: user._id },
            { token },
            { new: true }
        );
        user.token = updateToken.token;
        return res.status(200).send({
            status: true,
            message: "Admin login successfull",
            data: user,
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
}
);



// =========================[ All Products List for admin]============================



app.get('/:userId/Get_All_for_admin_Product',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const Products = await Product.find();
            const productsWithUserData = [];


            for (const product of Products) {
                const user = await Seller_Register.findById(product.UserId);
                const category = await Category.findById(product.Product_Category)
                if (user) {
                    const productWithUser = {
                        product: {
                            ...product._doc,
                            Product_Category: category.Category_Name,
                        },
                        user: {
                            _id: user._id,
                            Name: user.Name,
                            Profile_Image: user.Profile_Image,
                            Address: user.Address,
                            Primary_Number: user.Primary_Number,
                            Alternative_Number: user.Alternative_Number,
                            Primary_Email: user.Primary_Email,
                            Alternative_Email: user.Alternative_Email,
                            Company_Name: user.Company_Name,
                            Company_Website: user.Company_Website,
                        },
                    };
                    productsWithUserData.push(productWithUser);
                }
            }
            res.status(200).send({
                status: true,
                message: `get product retrieved successfully`,
                data: productsWithUserData,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    })


// =========================[ All Approved Products List for admin]============================



app.get('/:userId/Get_All_Approved_product_for_admin_Product',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const Products = await Product.find({ IsApproved: true });
            const productsWithUserData = [];


            for (const product of Products) {
                const user = await Seller_Register.findById(product.UserId);
                const category = await Category.findById(product.Product_Category)
                if (user) {
                    const productWithUser = {
                        product: {
                            ...product._doc,
                            Product_Category: category.Category_Name,
                        },
                        user: {
                            _id: user._id,
                            Name: user.Name,
                            Profile_Image: user.Profile_Image,
                            Address: user.Address,
                            Primary_Number: user.Primary_Number,
                            Alternative_Number: user.Alternative_Number,
                            Primary_Email: user.Primary_Email,
                            Alternative_Email: user.Alternative_Email,
                            Company_Name: user.Company_Name,
                            Company_Website: user.Company_Website,
                        },
                    };
                    productsWithUserData.push(productWithUser);
                }
            }
            res.status(200).send({
                status: true,
                message: `get product retrieved successfully`,
                data: productsWithUserData,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    })



// =========================[Approve the Products by admin]============================

app.get('/:userId/Approve_Product/:id/',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const userId = req.params.userId;
            const id = req.params.id;

            // Find the product by ID and the user ID
            const product = await Product.findOne({ _id: id });

            if (!product) {
                return res.status(404).send({
                    status: false,
                    message: "Product not found",
                    data: null,
                });
            }

            product.IsApproved = !product.IsApproved;

            await product.save();

            res.status(200).send({
                status: true,
                message: `Product Approval status changed to ${product.IsApproved}`,
                data: product,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    });

// ===========================[Create Category Api] =========================//


app.post(
    "/Create_Category",
    async (req, res) => {
        try {
            let data = req.body;

            let userCreated = await Category.create(data);
            return res.status(201).send({
                status: true,
                message: "Product Category Created Successfully",
                data: userCreated,
            });
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    }
);


// ===========================[Get all  Category Api] =========================//


app.get(
    "/Get_All_Category",
    async (req, res) => {
        try {
            const category = await Category.find();
            res.status(200).send({
                status: true,
                message: " Get All Category Successfully",
                data: category,
            })
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    }
);


// ===========================[ Delete Category by Id  Api] =========================//

app.get("/Delete_category/:id", async (req, res) => {
    try {
        const Id = req.params.id;
        const delete_category_data = await Category.findOneAndDelete({ _id: Id });

        if (!delete_category_data) {
            return res.status(404).send({
                status: false,
                message: "No Category found with this Id",
                data: delete_category_data,
            });
        }

        res.status(200).send({
            status: true,
            message: "Delete Category Successfully",
            data: delete_category_data,
        });
    } catch (error) {
        res.status(500).send({
            status: false,
            error: error.message,
        });
    }
});



// ==========================[Create Populaur city Api]========================================

app.post(
    "/Create_Populaur_City",
    async (req, res) => {
        try {
            let data = req.body;

            let userCreated = await CityModel.create(data);
            return res.status(201).send({
                status: true,
                message: "Populaor City Created Successfully",
                data: userCreated,
            });
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    }
);


// ===========================[Get all  Populaur City Api] =========================//


app.get(
    "/Get_All_Popular_City",
    async (req, res) => {
        try {
            const category = await CityModel.find();
            res.status(200).send({
                status: true,
                message: " Get All Popular City Successfully",
                data: category,
            })
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    }
);




// =========================[Get all Seller Api with Search by admin]============================

app.get('/:userId/Get_all_Seller/',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const id = req.params.id;
            const searchQuery = req.query.search;

            let query = {};
            if (searchQuery) {
                query = { Name: { $regex: new RegExp(searchQuery, 'i') } };
            }

            const All_seller = await Seller_Register.find(query);

            const All_Seller_data = All_seller.map(seller => ({
                Name: seller.Name,
                Primary_Email: seller.Primary_Email,
                Alternative_Email: seller.Alternative_Email,
                Primary_Number: seller.Primary_Number,
                Alternative_Number: seller.Alternative_Number,
                Company_Name: seller.Company_Name,
                Company_Website: seller.Company_Website,
                Gstin: seller.Gstin,
                Pan_Number: seller.Pan_Number,
                Address: seller.Address,
                date: seller.date
            }));

            res.status(200).send({
                status: true,
                message: "Get all Sellers Successful",
                data: All_Seller_data,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    });




// =========================[Get all Buyers Api with Search by admin]============================

app.get('/:userId/Get_all_Buyers/',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const id = req.params.id;
            const searchQuery = req.query.search;

            let query = {};
            if (searchQuery) {
                query = { Name: { $regex: new RegExp(searchQuery, 'i') } };
            }

            const All_seller = await UserModel.find(query);

            const All_Seller_data = All_seller.map(seller => ({
                Name: seller.Name,
                Primary_Email: seller.Primary_Email,
                Alternative_Email: seller.Alternative_Email,
                Primary_Number: seller.Primary_Number,
                Alternative_Number: seller.Alternative_Number,
                Company_Name: seller.Company_Name,
                Company_Website: seller.Company_Website,
                Gstin: seller.Gstin,
                Pan_Number: seller.Pan_Number,
                Address: seller.Address,
                date: seller.date
            }));

            res.status(200).send({
                status: true,
                message: "Get all Buyers Successful",
                data: All_Seller_data,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    });




// =========================[Get All UnApproved Products List for admin]============================


app.get('/:userId/Get_All_UnApproved_product_for_admin_Product',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const { search } = req.query;
            const filter = search ? { IsApproved: false, Product_Name: { $regex: search, $options: 'i' } } : { IsApproved: false };
            const Products = await Product.find(filter);
            const productsWithUserData = [];

            for (const product of Products) {
                const user = await Seller_Register.findById(product.UserId);
                const category = await Category.findById(product.Product_Category);
                if (user) {
                    const productWithUser = {
                        product: {
                            ...product._doc,
                            Product_Category: category.Category_Name,
                        },
                        user: {
                            _id: user._id,
                            Name: user.Name,
                            Profile_Image: user.Profile_Image,
                            Address: user.Address,
                            Primary_Number: user.Primary_Number,
                            Alternative_Number: user.Alternative_Number,
                            Primary_Email: user.Primary_Email,
                            Alternative_Email: user.Alternative_Email,
                            Company_Name: user.Company_Name,
                            Company_Website: user.Company_Website,
                        },
                    };
                    productsWithUserData.push(productWithUser);
                }
            }
            res.status(200).send({
                status: true,
                message: 'Unapproved products retrieved successfully',
                data: productsWithUserData,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
    });



// ================================[Create Blog Api] =====================//

app.post('/:userId/Create_blog',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const user_id = req.params.userId
            const data = req.body

            data.User_id = user_id
            const Created_blog = await Blogs.create(data)
            return res.status(201).send({
                status: true,
                message: "Blog Created Successfully",
                data: Created_blog,
            });
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    })


// ================================[Get All Blogs Api] =====================//


app.get('/Get_All_Blogs',
    async (req, res) => {
        try {
            const All_blogs = await Blogs.find()
            return res.status(200).send({
                status: true,
                message: "Get All blog Successfull",
                data: All_blogs,
            });

        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    })


//================================[delete blog Api] ============================

app.get('/Delete_Blogs/:id',
    async (req, res) => {
        try {
            const Id = req.params.id
            const All_blogs = await Blogs.findOneAndDelete({ _id: Id })
            return res.status(200).send({
                status: true,
                message: "Get All blog Successfull",
                data: All_blogs,
            });

        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    })



//===============================[Seller Apis]====================================//

// =============[Seller Register api]==================//

app.post('/Seller_Register', async function (req, res) {

    try {
        let data = req.body;
        let {
            Name,
            Profile_Image,
            Address,
            Primary_Number,
            Alternative_Number,
            Primary_Email,
            Alternative_Email,
            Company_Name,
            Company_Website,
            Pan_Number,
            Facebook,
            Instagram,
            Twitter,
            password,
            confirm_password,
        } = data;


        if (password !== confirm_password) {
            res.status(400).json({
                message: "Password and Confirm password not match"
            });
        }

        if (await Seller_Register.findOne({ Primary_Email: Primary_Email }))
            return res.status(400).send({ message: "Email already exist" });

        const encryptedPassword = bcrypt.hashSync(password, 12);
        req.body["password"] = encryptedPassword;

        var token = jwt.sign(
            {
                userId: Seller_Register._id,
            },
            "project"
        );
        data.token = token;

        let savedData = await Seller_Register.create(data);
        res.status(201).send({
            status: true,
            message: "Seller Register successfull",
            data: savedData
        });
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}
)

// =============[Seller login api]==================//
app.post('/Seller_Login', async function (req, res) {
    try {
        let data = req.body;
        let { Primary_Email, password } = data;

        let user = await Seller_Register.findOne({ Primary_Email: Primary_Email });

        if (!user) {
            return res.status(400).send({
                status: false,
                message: "Email and Password is Invalid",
            });
        }

        let compared = await bcrypt.compare(password, user.password);
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid",
            });
        }
        var token = jwt.sign(
            {
                userId: user._id,
            },
            "project"
        );

        let updateToken = await Seller_Register.findByIdAndUpdate(
            { _id: user._id },
            { token },
            { new: true }
        );
        user.token = updateToken.token;
        return res.status(200).send({
            status: true,
            message: "Seller login successfull",
            data: user,
            User: "Seller"
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
}
);


//============================[Update Seller profile ]==================================

app.put("/:userId/UpdateSellerprofile",
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const UserId = req.params.userId;
            const updatedData = req.body;
            const Seller = await Seller_Register.findOneAndUpdate({ _id: UserId }, updatedData, { new: true })
            if (Seller) {
                res.status(200).send({
                    status: true,
                    message: "Seller Update Successfully",
                    data: Seller,
                });
            } else {
                res.status(404).send({
                    status: false,
                    message: "Seller not found",
                    data: null,
                });
            }
        } catch (error) {
            res.status(500).send({
                status: false,
                message: error
            });
        }
    })

// ===========================[get Seller Profile api]=======================

app.get("/:userId/GetSellerProfile",
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        const UserId = req.params.userId;
        try {
            const Seller = await Seller_Register.findOne({ _id: UserId })
            const Userdata = {
                Name: Seller.Name,
                Email: Seller.Primary_Email,
                Alternative_Email: Seller.Alternative_Email,
                Profile_Image: Seller.Profile_Image,
                Primary_Number: Seller.Primary_Number,
                Alternative_Number: Seller.Alternative_Number,
                Address: Seller.Address,
                Company_Name: Seller.Company_Name,
                Company_Website: Seller.Company_Website,
                Gstin: Seller.Gstin,
                Pan_Number: Seller.Pan_Number,
                date: Seller.date
            }
            if (Seller) {
                res.status(200).send({
                    status: true,
                    message: "get Seller Profile Successfully",
                    data: Userdata,
                });
            } else {
                res.status(404).send({
                    status: false,
                    message: "Seller Profile not found",
                    data: null,
                });
            }
        } catch (error) {
            res.status(500).send({
                status: false,
                message: error
            });
        }
    }
)







// =========================[Upload Product]============================

app.post(
    "/:userId/Upload_Product",
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            let data = req.body;
            let userid = req.params.userId;

            let { UserId, Product_Name, Product_Price, Product_Category, Product_Image, Numbers_of_blade, Fan_Speed, Power, Sweep_Size, Color, Warrenty, Brand, Air_delivery, Model_name, Country_of_origin, Product_description, Product_Features, Available_color, About_the_company } = data;
            data.UserId = userid;

            let userCreated = await Product.create(data);
            return res.status(201).send({
                status: true,
                message: "Product uploaded successfully. Please wait for admin approval.",
                data: userCreated,
            });
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    }
);



// =========================[Get Approved Products]============================

app.get('/:userId/Get_Approved_Product',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const { userId } = req.params;
            const Products = await Product.find({ UserId: userId, IsApproved: true });
            const productsWithUserData = [];


            for (const product of Products) {
                const category = await Category.findById(product.Product_Category)
                const productWithUser = {
                    ...product._doc,
                    Product_Category: category.Category_Name,
                };
                productsWithUserData.push(productWithUser);
            }
            res.status(200).send({
                status: true,
                message: `Get Approved Product Successfully`,
                data: productsWithUserData,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    })



// =========================[Get UnApproved Products]============================

app.get('/:userId/Get_UnApproved_Product',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const { userId } = req.params;
            const Products = await Product.find({ UserId: userId, IsApproved: false });
            const productsWithUserData = [];
            for (const product of Products) {
                const category = await Category.findById(product.Product_Category)
                const productWithUser = {
                    ...product._doc,
                    Product_Category: category.Category_Name,
                };
                productsWithUserData.push(productWithUser);
            }
            res.status(200).send({
                status: true,
                message: `Get Approved Product Successfully`,
                data: productsWithUserData,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error.message })
        }
    })




// =========================[update Products]============================
app.put('/:userId/Update_Product/:id/',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const userId = req.params.userId;
            const id = req.params.id;
            const updatedData = req.body;
            const Products = await Product.findOneAndUpdate({ _id: id, UserId: userId }, updatedData, { new: true });

            if (Products) {
                res.status(200).send({
                    status: true,
                    message: "Product Update Successfully",
                    data: Products,
                });
            } else {
                res.status(404).send({
                    status: false,
                    message: "Product not found",
                    data: null,
                });
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).send({
                status: false,
                message: error,
                data: null,
            });
        }
    });



// =========================[Delete Products]============================

app.delete('/:userId/Delete_Product/:id/',
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const userId = req.params.userId;
            const id = req.params.id;

            const Products = await Product.findOneAndDelete({ _id: id, UserId: userId });

            if (Products) {
                res.status(200).send({
                    status: true,
                    message: "Product Delete Successfully",
                    data: Products,
                });
            } else {
                res.status(404).send({
                    status: false,
                    message: "Product not found",
                    data: null,
                });
            }
        } catch (error) {
            res.status(500).send({
                status: false,
                message: error,
                data: null,
            });
        }
    });





// ================================[User Apis]===============================//


// =============[User Register api]==================//

app.post('/User_Register', async function (req, res) {

    try {
        let data = req.body;
        let {
            Name,
            Profile_Image,
            Address,
            Primary_Number,
            Alternative_Number,
            Primary_Email,
            Alternative_Email,
            password,
            confirm_password,
        } = data;


        if (password !== confirm_password) {
            res.status(400).json({
                message: "Password and Confirm password not match"
            });
        } else {
            const userExists = await UserModel.findOne({ Primary_Email: Primary_Email });
            if (userExists) {
                res.status(400).json({
                    message: "Email already exists"
                });
            } else {
                const encryptedPassword = bcrypt.hashSync(password, 12);
                data.password = encryptedPassword;

                var token = jwt.sign(
                    {
                        userId: UserModel._id,
                    },
                    "project"
                );
                data.token = token;

                let savedData = await UserModel.create(data);
                res.status(201).json({
                    status: true,
                    message: "User Register successful",
                    data: savedData
                });
            }
        }
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}
)

// =============[User login api]==================//
app.post('/User_Login', async function (req, res) {
    try {
        let data = req.body;
        let { Primary_Email, password } = data;

        let user = await UserModel.findOne({ Primary_Email: Primary_Email });

        if (!user) {
            return res.status(400).send({
                status: false,
                message: "Email and Password is Invalid",
            });
        }

        let compared = await bcrypt.compare(password, user.password);
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid",
            });
        }
        var token = jwt.sign(
            {
                userId: user._id,
            },
            "project"
        );

        let updateToken = await UserModel.findByIdAndUpdate(
            { _id: user._id },
            { token },
            { new: true }
        );
        user.token = updateToken.token;
        return res.status(200).send({
            status: true,
            message: "User login successful",
            data: user,
            User: "User"
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
}
);



//============================[update User profile ]==================================

app.put("/:userId/UpdateUser",
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const UserId = req.params.userId;
            const updatedData = req.body;
            const User = await UserModel.findOneAndUpdate({ _id: UserId }, updatedData, { new: true })
            if (User) {
                res.status(200).send({
                    status: true,
                    message: "User Update Successfully",
                    data: User,
                });
            } else {
                res.status(404).send({
                    status: false,
                    message: "Product not found",
                    data: null,
                });
            }
        } catch (error) {
            res.status(500).send({
                status: false,
                message: error
            });
        }
    })

// ===========================[get User Profile api]=======================

app.get("/:userId/GetUserProfile",
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        const UserId = req.params.userId;
        try {
            const User = await UserModel.findOne({ _id: UserId })
            const Userdata = {
                Name: User.Name,
                Email: User.Primary_Email,
                Alternative_Email: User.Alternative_Email,
                Profile_Image: User.Profile_Image,
                Primary_Number: User.Primary_Number,
                Alternative_Number: User.Alternative_Number,
                Address: User.Address,
                date: User.date
            }
            if (User) {
                res.status(200).send({
                    status: true,
                    message: "get User Profile Successfully",
                    data: Userdata,
                });
            } else {
                res.status(404).send({
                    status: false,
                    message: "User Profile not found",
                    data: null,
                });
            }
        } catch (error) {
            res.status(500).send({
                status: false,
                message: error
            });
        }
    }
)

// =========================[Get Approved for all user Products]============================


app.get('/Get_Approved_Product_for_all_user', async (req, res) => {
    try {
        const Products = await Product.find({ IsApproved: true });
        const productsWithUserData = [];


        for (const product of Products) {
            const user = await Seller_Register.findById(product.UserId);
            const category = await Category.findById(product.Product_Category)
            if (user) {
                const productWithUser = {
                    product: {
                        ...product._doc,
                        Product_Category: category.Category_Name,
                    },
                    user: {
                        _id: user._id,
                        Name: user.Name,
                        Profile_Image: user.Profile_Image,
                        Address: user.Address,
                        Primary_Number: user.Primary_Number,
                        Alternative_Number: user.Alternative_Number,
                        Primary_Email: user.Primary_Email,
                        Alternative_Email: user.Alternative_Email,
                        Company_Name: user.Company_Name,
                        Company_Website: user.Company_Website,
                        date: user.date,
                    },
                };
                productsWithUserData.push(productWithUser);
            }
        }

        res.status(200).send({
            status: true,
            message: "Get Approved Product Successfully with User Data",
            data: productsWithUserData,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});




// =========================[Get Approved for all user Products by category]============================

app.get("/Get_Approved_Product_for_all_user_by_category/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const Products = await Product.find({ Product_Category: category, IsApproved: true });
        const productsWithUserData = [];


        for (const product of Products) {
            const user = await Seller_Register.findById(product.UserId);
            const category = await Category.findById(product.Product_Category)
            if (user) {
                const productWithUser = {
                    product: {
                        ...product._doc,
                        Product_Category: category.Category_Name,
                    },
                    user: {
                        _id: user._id,
                        Name: user.Name,
                        Profile_Image: user.Profile_Image,
                        Address: user.Address,
                        Primary_Number: user.Primary_Number,
                        Alternative_Number: user.Alternative_Number,
                        Primary_Email: user.Primary_Email,
                        Alternative_Email: user.Alternative_Email,
                        Company_Name: user.Company_Name,
                        Company_Website: user.Company_Website,
                    },
                };
                productsWithUserData.push(productWithUser);
            }
        }
        res.status(200).send({
            status: true,
            message: `get product with category '${category}' retrieved successfully`,
            data: productsWithUserData,
        });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
});

//=========================[Create Product Query ]===================================

app.post("/:userId/ProductQuery",
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const Userid = req.params.userId
            const data = req.body
            data.UserId = Userid

            const productquery = await ProductQuery.create(data)
            res.status(201).send({
                status: true,
                Message: 'Product Query is Created Successfull',
                Productquery: productquery
            })
        } catch (error) {
            res.status(500).send({ status: false, error: error.message });
        }
    })



//==============================[get User productQuery in Admin]==================

app.get("/:userId/GetProductQuery",
    Middleware.jwtValidation,
    Middleware.authorization,
    async (req, res) => {
        try {
            const productquery = await ProductQuery.find()
            const ProductNewQuery = []
            for (const product of productquery) {
                const userdata = await UserModel.findById(product.UserId)
                if (userdata) {
                    const Products = {
                        ...product._doc,
                        _id: userdata._id,
                        Name: userdata.Name,
                        Primary_Email: userdata.Primary_Email,
                    };
                    ProductNewQuery.push(Products);
                }
            }
            res.status(200).send({
                status: true,
                Message: 'Get Product Query Successful',
                Productquery: ProductNewQuery
            })
        } catch (error) {
            res.status(500).send({ status: false, error: error.message });
        }
    })






app.listen(3000, () => {
    console.log("node Api app is running on port 3000")
})

mongoose.connect('mongodb+srv://vikasclumpcoder:vikasclumpcoder@nodejsapi.kj7vee3.mongodb.net/Node-API?retryWrites=true&w=majority')
    .then(() => {
        console.log('Database is Connected!');
    })
    .catch((error) => {
        console.log(error)
    });